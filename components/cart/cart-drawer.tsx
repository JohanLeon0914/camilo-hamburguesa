"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { formatCOP } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotal, itemCount } = useCartStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!getSupabaseBrowserEnv()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(Boolean(data.user)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(Boolean(session?.user)));
    return () => listener.subscription.unsubscribe();
  }, []);

  const visibleItems = hasHydrated ? items : [];
  const visibleItemCount = hasHydrated ? itemCount() : 0;
  const visibleSubtotal = hasHydrated ? subtotal() : 0;

  function goToCheckout() {
    if (isLoggedIn) {
      window.location.assign("/checkout");
      return;
    }
    setShowLoginModal(true);
  }

  async function signInWithGoogle() {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/checkout")}` }
    });
  }

  return (
    <>
      {visibleItemCount > 0 && (
        <button
          onClick={() => useCartStore.getState().openCart()}
          className="fixed bottom-4 left-4 right-4 z-30 flex items-center justify-between rounded-md bg-char px-4 py-3 font-black text-white shadow-2xl md:hidden"
        >
          <span>Ver carrito</span>
          <span>{itemCount()} productos · {formatCOP(subtotal())}</span>
        </button>
      )}

      <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          aria-label="Cerrar carrito"
          onClick={closeCart}
          className={`absolute inset-0 bg-char/45 transition ${isOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-char/10 p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <h2 className="text-lg font-black">Tu carrito</h2>
            </div>
            <button onClick={closeCart} className="rounded-md p-2 hover:bg-surface" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>

          {visibleItems.length === 0 ? (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <p className="text-2xl font-black">Tu carrito está vacío</p>
                <p className="mt-2 text-cream/60">Explora el menú y encuentra tu próxima hamburguesa.</p>
                <Link href="/menu" onClick={closeCart} className="mt-5 inline-flex rounded-md bg-ember px-5 py-3 font-black text-white">
                  Ver menú
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-auto p-4">
                {visibleItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 rounded-lg bg-surface p-3 shadow-sm">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-char">
                      {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-2">
                        <h3 className="flex-1 truncate font-black">{item.name}</h3>
                        <button onClick={() => removeItem(item.productId)} className="text-char/45 hover:text-ember" aria-label="Eliminar">
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-ember">{formatCOP(item.price)}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <button onClick={() => setQuantity(item.productId, item.quantity - 1)} className="rounded-md border p-1.5" aria-label="Disminuir">
                          <Minus size={15} />
                        </button>
                        <span className="w-8 text-center font-black">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.productId, item.quantity + 1)} className="rounded-md border p-1.5" aria-label="Aumentar">
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-char/10 bg-surface p-4">
                <div className="mb-4 flex items-center justify-between text-lg font-black">
                  <span>Subtotal</span>
                  <span>{formatCOP(visibleSubtotal)}</span>
                </div>
                <button type="button" onClick={goToCheckout} className="block w-full rounded-md bg-ember px-5 py-3 text-center font-black text-white transition hover:bg-char">
                  Ordenar
                </button>
              </div>
            </>
          )}
        </aside>
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-char/60 p-4" onClick={() => setShowLoginModal(false)} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
          <div className="w-full max-w-md rounded-lg bg-paper p-6 text-char shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-black uppercase text-ember">Antes de ordenar</p>
                <h2 id="login-modal-title" className="mt-1 text-2xl font-black text-white">Inicia sesión con Google</h2>
              </div>
              <button type="button" onClick={() => setShowLoginModal(false)} className="rounded-md p-2 hover:bg-surface text-white" aria-label="Cerrar ventana"><X size={20} /></button>
            </div>
            <p className="mt-4 text-sm text-char/70 text-white">Necesitamos tu cuenta para guardar la dirección, crear el pedido y mostrarte el estado del pago.</p>
            <button type="button" onClick={signInWithGoogle} disabled={!getSupabaseBrowserEnv()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-ember px-5 py-3 font-black text-white transition hover:bg-char disabled:opacity-60">
              <LogIn size={18} /> Continuar con Google
            </button>
          </div>
        </div>
      )}
    </>
  );
}
