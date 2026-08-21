"use client";

import Link from "next/link";
import { Home, Menu, ShoppingCart, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const itemCount = useCartStore((state) => state.itemCount());
  const openCart = useCartStore((state) => state.openCart);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const hasSupabase = Boolean(getSupabaseBrowserEnv());

  useEffect(() => setHasHydrated(true), []);

  useEffect(() => {
    if (!hasSupabase) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: admin } = await supabase.from("admins").select("email").eq("email", data.user.email ?? "").maybeSingle();
        setIsAdmin(Boolean(admin));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, [hasSupabase]);

  async function signIn() {
    if (!hasSupabase) return;
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const siteUrl = configuredSiteUrl || window.location.origin;
    await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${siteUrl}/auth/callback` } });
  }

  async function signOut() {
    if (!hasSupabase) return;
    await createClient().auth.signOut();
    setEmail(null);
    setIsAdmin(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-char bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-ember text-lg font-black text-white shadow-glow">C</span>
          <span className="leading-tight"><span className="block text-sm font-black uppercase tracking-wide">Camilo</span><span className="block text-xs font-semibold text-cream/60">Hamburguesas</span></span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/" icon={<Home size={17} />}>Inicio</NavLink>
          <NavLink href="/menu" icon={<Menu size={17} />}>Menú</NavLink>
          {email && <NavLink href="/orders" icon={<UserRound size={17} />}>Mis órdenes</NavLink>}
          {isAdmin && <NavLink href="/admin" icon={<ShieldCheck size={17} />}>Admin</NavLink>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={openCart} className="relative rounded-md border border-char/20 bg-surface px-3 py-2 text-sm font-bold transition hover:border-ember" aria-label="Abrir carrito">
            <ShoppingCart size={19} />
            {hasHydrated && itemCount > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-mustard px-1 text-xs text-char">{itemCount}</span>}
          </button>
          {email ? <button onClick={signOut} className="rounded-md bg-char px-4 py-2 text-sm font-bold text-white transition hover:bg-ember">Salir</button> : <button onClick={signIn} disabled={!hasSupabase} className={cn("rounded-md bg-ember px-4 py-2 text-sm font-bold text-white transition hover:bg-char", !hasSupabase && "cursor-not-allowed opacity-60")}>Iniciar sesión</button>}
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <Link href={href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-cream/75 transition hover:bg-surface hover:text-ember">{icon}{children}</Link>;
}


