import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import { formatCOP, formatDateCO, shortOrderId } from "@/lib/utils";

const PAGE_SIZE = 10;
export const dynamic = "force-dynamic";

type HistoryOrder = {
  id: string;
  delivered_at: string | null;
  created_at: string;
  customer_name: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  order_items: Array<{ id: string; quantity: number; product_name: string }>;
};

export default async function AdminHistoryPage({
  searchParams
}: {
  searchParams: { page?: string; from?: string; to?: string; product?: string };
}) {
  if (!getSupabaseBrowserEnv()) {
    return <HistoryShell orders={[]} page={1} total={0} searchParams={searchParams} setupMissing />;
  }

  const supabase = createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const page = Math.max(Number(searchParams.page ?? "1"), 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select("*, order_items(*)", { count: "exact" })
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false })
    .range(from, to);

  if (searchParams.from) query = query.gte("delivered_at", searchParams.from);
  if (searchParams.to) query = query.lte("delivered_at", `${searchParams.to}T23:59:59`);

  const { data: rawOrders, count } = await query;
  const orders = (rawOrders ?? []) as unknown as HistoryOrder[];
  const filtered = searchParams.product
    ? orders.filter((order) =>
        order.order_items.some((item) => item.product_name.toLowerCase().includes(String(searchParams.product).toLowerCase()))
      )
    : orders;

  return <HistoryShell orders={filtered} page={page} total={count ?? filtered.length} searchParams={searchParams} />;
}

function HistoryShell({
  orders,
  page,
  total,
  searchParams,
  setupMissing = false
}: {
  orders: HistoryOrder[];
  page: number;
  total: number;
  searchParams: { from?: string; to?: string; product?: string };
  setupMissing?: boolean;
}) {
  const nextPage = page + 1;
  const previousPage = Math.max(page - 1, 1);
  const hasNext = page * PAGE_SIZE < total;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="font-bold text-ember">Volver al panel</Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-black uppercase text-ember">Admin</p>
          <h1 className="text-4xl font-black">Pedidos entregados</h1>
        </div>
      </div>
      {setupMissing && <p className="mt-4 rounded-md bg-mustard p-3 text-sm font-bold">Configura Supabase para consultar historial real.</p>}

      <form className="mt-6 grid gap-3 rounded-lg bg-surface p-4 shadow-sm sm:grid-cols-4">
        <Field type="date" name="from" label="Desde" defaultValue={searchParams.from} />
        <Field type="date" name="to" label="Hasta" defaultValue={searchParams.to} />
        <Field name="product" label="Producto" defaultValue={searchParams.product} placeholder="Bacon" />
        <button className="self-end rounded-md bg-char px-4 py-2 font-black text-white">Filtrar</button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-char/10 bg-surface shadow-sm">
        <div className="hidden grid-cols-[1fr_1fr_1.2fr_1fr_1fr_1fr] gap-4 bg-char px-4 py-3 text-sm font-black text-cream md:grid">
          <span>Orden</span><span>Fecha</span><span>Cliente</span><span>Productos</span><span>Descuento</span><span>Total</span>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-cream/60">No hay pedidos entregados para estos filtros.</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="grid gap-2 border-t border-char/10 px-4 py-4 text-sm md:grid-cols-[1fr_1fr_1.2fr_1fr_1fr_1fr] md:gap-4">
              <span className="font-black">{shortOrderId(order.id)}</span>
              <span>{formatDateCO(order.delivered_at ?? order.created_at)}</span>
              <span>{order.customer_name}</span>
              <span>{order.order_items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              <span>{formatCOP(order.discount_amount)}</span>
              <span className="font-black text-ember">{formatCOP(order.total)}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Link href={{ pathname: "/admin/history", query: { ...searchParams, page: previousPage } }} className="rounded-md border border-char/15 px-4 py-2 font-bold">
          Anterior
        </Link>
        <Link href={{ pathname: "/admin/history", query: { ...searchParams, page: nextPage } }} className={`rounded-md bg-char px-4 py-2 font-bold text-white ${!hasNext ? "pointer-events-none opacity-50" : ""}`}>
          Siguiente
        </Link>
      </div>
    </section>
  );
}

function Field(props: { name: string; label: string; type?: string; defaultValue?: string; placeholder?: string }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-bold ">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        className="w-full rounded-md border border-char/15 px-3 py-2 text-black"
      />
    </label>
  );
}


