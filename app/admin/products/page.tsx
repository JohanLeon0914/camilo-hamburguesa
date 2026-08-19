import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!getSupabaseBrowserEnv()) {
    return <ProductManagementShell><ProductCreateForm setupMissing /></ProductManagementShell>;
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  return <ProductManagementShell><ProductCreateForm /></ProductManagementShell>;
}

function ProductManagementShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-surface px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="font-bold text-ember">Volver al panel</Link>
        <div className="mt-4">
          <p className="font-black uppercase text-ember">Admin</p>
          <h1 className="text-4xl font-black">Gestionar menú</h1>
          <p className="mt-2 text-cream/65">Agrega nuevos productos y define cómo aparecerán en la carta.</p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
