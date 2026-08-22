"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOrderSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import type { Json } from "@/lib/supabase/database.types";

export type CreateOrderResult =
  | { ok: true; orderId: string; total: number; whatsappUrl: string }
  | { ok: false; message: string };

export async function createOrderAction(input: z.infer<typeof createOrderSchema>): Promise<CreateOrderResult> {
  if (!getSupabaseBrowserEnv()) return { ok: false, message: "Configura Supabase antes de crear pedidos reales." };
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, message: "Inicia sesión con Google para confirmar el pedido." };

  type CreateOrderRpc = (fn: "create_order_secure", args: { payload_items: Json; payload_address_id: string | null; payload_address: Json | null }) => Promise<{
    data: { order_id: string; subtotal: number; discount_amount: number; total: number }[] | null;
    error: { message: string } | null;
  }>;
  const rpcCreateOrder = (supabase.rpc as unknown as CreateOrderRpc).bind(supabase);
  const { data, error } = await rpcCreateOrder("create_order_secure", {
    payload_items: parsed.data.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    payload_address_id: parsed.data.addressId ?? null,
    payload_address: parsed.data.address ?? null
  });
  if (error || !data?.[0]) {
    console.error("create_order_secure failed", error);
    return { ok: false, message: "No pudimos crear tu pedido. Inténtalo nuevamente." };
  }

  const { data: rawOrder } = await supabase.from("orders")
    .select("id, customer_name, customer_phone, delivery_address, delivery_details, subtotal, discount_amount, total, order_items(product_name, quantity, line_total)")
    .eq("id", data[0].order_id).single();
  const order = rawOrder as unknown as {
    id: string; customer_name: string; customer_phone: string; delivery_address: string; delivery_details: string | null;
    subtotal: number; discount_amount: number; total: number;
    order_items: { product_name: string; quantity: number; line_total: number }[];
  } | null;
  if (!order) return { ok: false, message: "El pedido fue creado, pero no pudimos preparar el mensaje de WhatsApp." };

  const itemsText = order.order_items.map((item) => `- ${item.quantity}x ${item.product_name}: ${formatCOPForMessage(item.line_total)}`).join("\n");
  const message = [
    "Hola, quiero confirmar mi pedido de Camilo Hamburguesas:", `Cliente: ${order.customer_name}`, `Celular: ${order.customer_phone}`,
    `Dirección: ${order.delivery_address}`, order.delivery_details ? `Detalles: ${order.delivery_details}` : "",
    "", "Productos:", itemsText, "", `Subtotal: ${formatCOPForMessage(order.subtotal)}`,
    `Descuento: ${formatCOPForMessage(order.discount_amount)}`, `Total: ${formatCOPForMessage(order.total)}`,
    "Adjunto la captura del pago realizado."
  ].filter(Boolean).join("\n");
  revalidatePath("/orders");
  revalidatePath("/admin");
  return { ok: true, orderId: order.id, total: order.total, whatsappUrl: `https://wa.me/573154243639?text=${encodeURIComponent(message)}` };
}

function formatCOPForMessage(value: number) {
  return `$${new Intl.NumberFormat("es-CO").format(value)} COP`;
}

export async function markOrderDeliveredAction(orderId: string) {
  const supabase = createClient();
  const { data: admin } = await supabase.rpc("is_admin");
  if (!admin) return { ok: false, message: "No tienes permisos para modificar pedidos." };
  const ordersTable = supabase.from("orders") as unknown as OrderUpdateQuery;
  const { error } = await ordersTable.update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", orderId);
  if (error) return { ok: false, message: "No pudimos marcar la orden como entregada." };
  revalidatePath("/admin"); revalidatePath("/admin/history");
  return { ok: true };
}

export async function cancelOrderAction(orderId: string) {
  const supabase = createClient();
  const { data: admin } = await supabase.rpc("is_admin");
  if (!admin) return { ok: false, message: "No tienes permisos para cancelar pedidos." };
  const ordersTable = supabase.from("orders") as unknown as OrderUpdateQuery;
  const { error } = await ordersTable.update({ status: "cancelled" }).eq("id", orderId).in("status", ["pending", "preparing", "ready"]);
  if (error) return { ok: false, message: "No pudimos cancelar el pedido." };
  revalidatePath("/admin"); revalidatePath("/admin/history"); revalidatePath("/orders"); revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}

type OrderUpdateQuery = {
  update: (values: { status: "delivered" | "cancelled"; delivered_at?: string }) => {
    eq: (column: "id", value: string) => {
      in: (column: "status", values: ("pending" | "preparing" | "ready")[]) => Promise<{ error: { message: string } | null }>;
    } & Promise<{ error: { message: string } | null }>;
  };
};
