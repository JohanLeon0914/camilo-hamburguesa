import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import type { OrderWithItems } from "@/lib/order-types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!getSupabaseBrowserEnv()) {
    return <AdminDashboard initialOrders={[]} setupMissing />;
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const { data: rawInitialOrders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("payment_status", "paid")
    .in("status", ["pending", "preparing", "ready"])
    .order("created_at", { ascending: true });
  const initialOrders = (rawInitialOrders ?? []) as unknown as OrderWithItems[];

  return <AdminDashboard initialOrders={initialOrders} />;
}
