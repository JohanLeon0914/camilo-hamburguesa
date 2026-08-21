import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatCOP, formatDateCO, shortOrderId } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/order-types";
import { getOrderStatusLabel } from "@/lib/order-status";
import { syncMercadoPagoPayment } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { payment?: string; payment_id?: string } }) {
  if (!getSupabaseBrowserEnv()) notFound();

  const supabase = createClient();
  let { data: rawOrder } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", params.id)
    .single();
  const order = rawOrder as unknown as OrderWithItems | null;

  if (!order) notFound();

  if (searchParams.payment_id && order.payment_status !== "paid") {
    try {
      await syncMercadoPagoPayment(order.id, searchParams.payment_id);
      const refreshed = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", params.id)
        .single();
      rawOrder = refreshed.data;
    } catch (error) {
      console.error("Mercado Pago return confirmation failed", error);
    }
  }

  const currentOrder = rawOrder as unknown as OrderWithItems;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/orders" className="font-bold text-ember">Volver a mis pedidos</Link>
      <div className="mt-5 rounded-lg bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-black uppercase text-ember">Pedido recibido</p>
            <h1 className="mt-1 text-4xl font-black">Orden {shortOrderId(order.id)}</h1>
            <p className="mt-2 text-cream/60">{formatDateCO(currentOrder.created_at)}</p>
          </div>
          <span className="rounded-md bg-char px-3 py-1 text-sm font-black uppercase text-white">{getOrderStatusLabel(currentOrder.status)}</span>
        </div>

        {searchParams.payment === "success" && currentOrder.payment_status === "paid" && (
          <p className="mt-5 rounded-md bg-green-100 px-4 py-3 font-bold text-green-900">Pago confirmado correctamente.</p>
        )}
        {searchParams.payment === "success" && currentOrder.payment_status !== "paid" && (
          <p className="mt-5 rounded-md bg-mustard px-4 py-3 font-bold text-char">Mercado Pago recibió tu pago. Estamos validando la confirmación.</p>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="font-black">Productos</h2>
            <div className="mt-3 space-y-3">
              {currentOrder.order_items.map((item) => (
                <div key={item.id} className="flex justify-between rounded-md bg-paper p-3">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span className="font-black">{formatCOP(item.line_total)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-black">Entrega</h2>
            <div className="mt-3 rounded-md bg-paper p-4 text-sm leading-7 text-cream/75">
              <p className="font-black text-char">{currentOrder.customer_name}</p>
              <p>{currentOrder.customer_phone}</p>
              <p>{currentOrder.delivery_address}</p>
              {currentOrder.delivery_details && <p>{currentOrder.delivery_details}</p>}
            </div>
            <div className="mt-4 space-y-2 rounded-md bg-char p-4 text-cream">
              <Row label="Subtotal" value={formatCOP(currentOrder.subtotal)} />
              <Row label="Descuento" value={`-${formatCOP(currentOrder.discount_amount)}`} />
              <Row label="Total" value={formatCOP(currentOrder.total)} strong />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-cream/15 pt-3 text-lg font-black" : "text-sm"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}


