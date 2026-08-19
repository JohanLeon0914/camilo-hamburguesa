import Link from "next/link";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatCOP, formatDateCO, shortOrderId } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/order-types";
import { getOrderStatusLabel } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  if (!getSupabaseBrowserEnv()) {
    return <Empty title="Configura Supabase" text="El historial se cargará cuando conectes el proyecto." />;
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <Empty title="Inicia sesión" text="Necesitas iniciar sesión con Google para ver tus pedidos." />;

  const { data: rawOrders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });
  const orders = (rawOrders ?? []) as unknown as OrderWithItems[];

  if (!orders?.length) {
    return <Empty title="Todavía no tienes pedidos" text="Cuando confirmes tu primera hamburguesa aparecerá aquí." />;
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">Mis pedidos</h1>
      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="rounded-lg bg-surface p-5 shadow-sm transition hover:shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xl font-black">{shortOrderId(order.id)}</p>
                <p className="text-sm text-cream/60">{formatDateCO(order.created_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{getOrderStatusLabel(order.status)}</Badge>
                {order.loyalty_discount_applied && <Badge tone="gold">10% descuento</Badge>}
              </div>
              <p className="text-xl font-black text-ember">{formatCOP(order.total)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-3 text-cream/65">{text}</p>
      <Link href="/menu" className="mt-6 inline-flex rounded-md bg-ember px-5 py-3 font-black text-white">Ver menú</Link>
    </section>
  );
}

function Badge({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "gold" }) {
  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-black uppercase ${tone === "gold" ? "bg-mustard text-char" : "bg-char text-white"}`}>
      {children}
    </span>
  );
}
