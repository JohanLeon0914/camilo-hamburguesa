"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { formatCOP } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotal, itemCount } = useCartStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const visibleItems = hasHydrated ? items : [];
  const visibleItemCount = hasHydrated ? itemCount() : 0;
  const visibleSubtotal = hasHydrated ? subtotal() : 0;

  return (
    <>
      {visibleItemCount > 0 && (
        <button
          onClick={() => useCartStore.getState().openCart()}
          className="fixed bottom-4 left-4 right-4 z-30 flex items-center justify-between rounded-md bg-char px-4 py-3 font-black text-white shadow-2xl md:hidden"
        >
          <span>Ver carrito</span>
          <span>{itemCount()} productos â€¢ {formatCOP(subtotal())}</span>
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
                <p className="text-2xl font-black">Tu carrito estÃ¡ vacÃ­o</p>
                <p className="mt-2 text-cream/60">Explora el menÃº y encuentra tu prÃ³xima hamburguesa.</p>
                <Link href="/menu" onClick={closeCart} className="mt-5 inline-flex rounded-md bg-ember px-5 py-3 font-black text-white">
                  Ver menÃº
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
                <Link href="/checkout" onClick={closeCart} className="block rounded-md bg-ember px-5 py-3 text-center font-black text-white transition hover:bg-char">
                  Ir al checkout
                </Link>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}


