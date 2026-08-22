"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Clock, ReceiptText, TicketPercent } from "lucide-react";
import { cancelOrderAction, markOrderDeliveredAction } from "@/app/actions/orders";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";
import type { OrderWithItems } from "@/lib/order-types";
import { formatCOP, formatDateCO, shortOrderId } from "@/lib/utils";

type Order = OrderWithItems;

export function AdminDashboard({ initialOrders, setupMissing = false }: { initialOrders: Order[]; setupMissing?: boolean }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState<Order | null>(initialOrders[0] ?? null);
  const [isPending, startTransition] = useTransition();

  const metrics = useMemo(() => ({
    active: orders.length,
    sales: orders.reduce((total, order) => total + order.total, 0),
    products: orders.reduce((total, order) => total + order.order_items.reduce((sum, item) => sum + item.quantity, 0), 0)
  }), [orders]);

  useEffect(() => {
    if (!getSupabaseBrowserEnv()) return;
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, async (payload) => {
        const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", payload.new.id).single();
        if (data) {
          const order = data as unknown as OrderWithItems;
          setOrders((current) => [order, ...current.filter((currentOrder) => currentOrder.id !== order.id)]);
          setSelected(order);
          toast.success("Nueva orden recibida");
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const updated = payload.new as Database["public"]["Tables"]["orders"]["Row"];
        setOrders((current) => current.filter((order) => order.id !== updated.id || !["delivered", "cancelled"].includes(updated.status))
          .map((order) => (order.id === updated.id ? { ...order, ...updated } : order)));
        if (["delivered", "cancelled"].includes(updated.status)) setSelected(null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function markDelivered(orderId: string) {
    if (!window.confirm("¿Marcar esta orden como entregada?")) return;
    startTransition(async () => {
      const result = await markOrderDeliveredAction(orderId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Orden entregada");
      setOrders((current) => current.filter((order) => order.id !== orderId));
      setSelected(null);
    });
  }

  function cancelOrder(orderId: string) {
    if (!window.confirm("¿Cancelar este pedido? Esta acción no se puede deshacer desde aquí.")) return;
    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      if (!result.ok) { toast.error(result.message); return; }
      toast.success("Pedido cancelado");
      setOrders((current) => current.filter((order) => order.id !== orderId));
      setSelected(null);
    });
  }

  return (
    <section className="min-h-screen bg-surface">
      <div className="border-b border-char/10 bg-char px-4 py-5 text-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-mustard">Admin</p>
            <h1 className="text-3xl font-black">Pedidos activos</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products" className="rounded-md border border-cream/20 px-4 py-2 font-black hover:bg-cream hover:text-char">
              Gestionar menú
            </Link>
            <Link href="/admin/history" className="rounded-md border border-cream/20 px-4 py-2 font-black hover:bg-cream hover:text-char">
              Pedidos entregados
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          {setupMissing && <div className="rounded-md bg-mustard p-3 text-sm font-bold">Configura Supabase para recibir pedidos en tiempo real.</div>}
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Activos" value={String(metrics.active)} icon={<Clock size={18} />} />
            <Metric label="Items" value={String(metrics.products)} icon={<ReceiptText size={18} />} />
            <Metric label="Ventas" value={formatCOP(metrics.sales)} icon={<CheckCircle2 size={18} />} />
          </div>
          {orders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-char/20 p-8 text-center text-cream/60">No hay pedidos pendientes.</div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="w-full rounded-lg border border-char/10 bg-paper p-4 text-left transition hover:border-ember"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">{shortOrderId(order.id)}</p>
                      <p className="text-sm text-cream/60">{order.customer_name} · {formatDateCO(order.created_at)}</p>
                    </div>
                    <p className="font-black text-ember">{formatCOP(order.total)}</p>
                  </div>
                  <p className="mt-2 text-sm font-bold">{order.order_items.reduce((sum, item) => sum + item.quantity, 0)} productos</p>
                  {order.loyalty_discount_applied && <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-mustard px-2 py-1 text-xs font-black text-black"><TicketPercent size={14} /> 10% descuento</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-char/10 bg-paper p-5">
          {selected ? (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-black text-ember">{shortOrderId(selected.id)}</p>
                  <h2 className="text-3xl font-black">{selected.customer_name}</h2>
                  <p className="text-cream/60">{selected.customer_phone}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={isPending} onClick={() => markDelivered(selected.id)} className="rounded-md bg-ember px-4 py-3 font-black text-white hover:bg-char disabled:opacity-60">Marcar entregado</button>
                  <button disabled={isPending} onClick={() => cancelOrder(selected.id)} className="rounded-md border border-red-700 px-4 py-3 font-black text-red-700 hover:bg-red-50 disabled:opacity-60">Cancelar pedido</button>
                </div>
              </div>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div>
                  <h3 className="font-black">Productos</h3>
                  <div className="mt-3 space-y-2">
                    {selected.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between rounded-md bg-surface p-3">
                        <span>{item.quantity} x {item.product_name}</span>
                        <span className="font-black">{formatCOP(item.line_total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-black">Entrega</h3>
                  <div className="mt-3 rounded-md bg-surface p-4 text-sm leading-7">
                    <p>{selected.delivery_address}</p>
                    {selected.delivery_details && <p>{selected.delivery_details}</p>}
                  </div>
                  <div className="mt-3 rounded-md bg-char p-4 text-cream">
                    <Row label="Subtotal" value={formatCOP(selected.subtotal)} />
                    <Row label="Descuento" value={`-${formatCOP(selected.discount_amount)}`} />
                    <Row label="Total" value={formatCOP(selected.total)} strong />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center text-center text-cream/60">
              Selecciona una orden para ver el detalle.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-char p-3 text-cream">
      <div className="text-mustard">{icon}</div>
      <p className="mt-2 text-xs text-cream/60">{label}</p>
      <p className="truncate font-black">{value}</p>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "mt-2 border-t border-cream/15 pt-2 text-lg font-black" : "text-sm"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
