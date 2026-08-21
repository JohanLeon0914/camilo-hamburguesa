"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOrderSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import type { Json } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMercadoPagoPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";

export type CreateOrderResult =
  | { ok: true; orderId: string; total: number; checkoutUrl: string }
  | { ok: false; message: string };

export async function createOrderAction(input: z.infer<typeof createOrderSchema>): Promise<CreateOrderResult> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, message: "Configura Supabase antes de crear pedidos reales." };
  }
  if (!isMercadoPagoConfigured()) {
    return { ok: false, message: "Mercado Pago aún no está configurado. Agrega MERCADOPAGO_ACCESS_TOKEN al .env del servidor." };
  }

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, message: "Inicia sesión con Google para confirmar el pedido." };
  }

  type CreateOrderRpc = (
    fn: "create_order_secure",
    args: {
      payload_items: Json;
      payload_address_id: string | null;
      payload_address: Json | null;
    }
  ) => Promise<{
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

  try {
    const preference = await createMercadoPagoPreference(data[0].order_id, data[0].total, userData.user.email ?? "");
    if (!preference.checkoutUrl) throw new Error("Mercado Pago no devolvió checkoutUrl");
    await createAdminClient().from("orders").update({ mercado_pago_preference_id: preference.id }).eq("id", data[0].order_id);
    revalidatePath("/orders");
    revalidatePath("/admin");
    return { ok: true, orderId: data[0].order_id, total: data[0].total, checkoutUrl: preference.checkoutUrl };
  } catch (error) {
    console.error("Mercado Pago preference failed", error);
    await createAdminClient().from("orders").update({ payment_status: "failed" }).eq("id", data[0].order_id);
    return { ok: false, message: "No pudimos abrir el pago de Mercado Pago. Inténtalo nuevamente." };
  }
}

export async function markOrderDeliveredAction(orderId: string) {
  const supabase = createClient();
  const { data: admin } = await supabase.rpc("is_admin");
  if (!admin) {
    return { ok: false, message: "No tienes permisos para modificar pedidos." };
  }

  type OrdersUpdateQuery = {
    update: (values: { status: "delivered"; delivered_at: string }) => {
      eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
    };
  };

  const ordersTable = supabase.from("orders") as unknown as OrdersUpdateQuery;
  const { error } = await ordersTable
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error("mark delivered failed", error);
    return { ok: false, message: "No pudimos marcar la orden como entregada." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/history");
  return { ok: true };
}
