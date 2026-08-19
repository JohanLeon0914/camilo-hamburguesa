import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

export const dynamic = "force-dynamic";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Address = Database["public"]["Tables"]["addresses"]["Row"];

export default async function ProfilePage() {
  if (!getSupabaseBrowserEnv()) {
    return <Shell title="Configura Supabase" text="El perfil se sincroniza automáticamente al activar Google OAuth." />;
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/");

  const { data: rawProfile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
  const { data: rawAddresses } = await supabase.from("addresses").select("*").eq("user_id", userData.user.id).order("last_used_at", { ascending: false });
  const profile = rawProfile as unknown as Profile | null;
  const addresses = (rawAddresses ?? []) as unknown as Address[];

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">Perfil</h1>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <h2 className="text-xl font-black">Datos</h2>
          <p className="mt-3 text-cream/65">{profile?.full_name ?? "Sin nombre"}</p>
          <p className="text-cream/65">{profile?.email ?? userData.user.email}</p>
          <p className="mt-4 font-black text-ember">{profile?.completed_orders_count ?? 0} pedidos entregados</p>
        </div>
        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <h2 className="text-xl font-black">Direcciones</h2>
          <div className="mt-3 space-y-3">
            {addresses?.length ? addresses.map((address) => (
              <div key={address.id} className="rounded-md bg-paper p-3 text-sm">
                <p className="font-black">{address.label}</p>
                <p>{address.recipient_name} · {address.phone}</p>
                <p>{address.address}</p>
              </div>
            )) : <p className="text-cream/60">Aún no tienes direcciones guardadas.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Shell({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-3 text-cream/65">{text}</p>
    </section>
  );
}

