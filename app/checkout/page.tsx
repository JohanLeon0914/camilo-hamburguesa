import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Address = Database["public"]["Tables"]["addresses"]["Row"];

export default async function CheckoutPage() {
  if (!getSupabaseBrowserEnv()) {
    return <CheckoutClient addresses={[]} loyalty={{ delivered: 0, consumed: 0 }} setupMissing />;
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return <CheckoutClient addresses={[]} loyalty={{ delivered: 0, consumed: 0 }} />;
  }

  const [{ data: rawAddresses }, { count: delivered }, { count: consumed }] = await Promise.all([
    supabase.from("addresses").select("*").eq("user_id", userData.user.id).order("last_used_at", { ascending: false, nullsFirst: false }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userData.user.id).eq("status", "delivered"),
    supabase.from("loyalty_redemptions").select("id", { count: "exact", head: true }).eq("user_id", userData.user.id)
  ]);
  const addresses = (rawAddresses ?? []) as unknown as Address[];

  return <CheckoutClient addresses={addresses} loyalty={{ delivered: delivered ?? 0, consumed: consumed ?? 0 }} />;
}
