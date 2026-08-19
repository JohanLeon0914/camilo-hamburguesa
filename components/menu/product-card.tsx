"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBasket, Zap } from "lucide-react";
import { toast } from "sonner";
import { formatCOP } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { useCartStore } from "@/stores/cart-store";

type ProductCardProps = {
  product: Product;
  variant?: "card" | "diagonal";
  reverse?: boolean;
};

export function ProductCard({ product, variant = "card", reverse = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  function addToCart() {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image_url });
    toast.success(`${product.name} agregado al carrito`, {
    position: "bottom-center" // Valores: top-right, top-center, top-left, bottom-right, bottom-center, bottom-left
});
  }

  function orderNow() {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image_url });
  }

  const image = (
    <div className={`relative overflow-hidden bg-char ${variant === "diagonal" ? "min-h-64 lg:min-h-80 lg:flex-1" : "aspect-[4/3]"}`}>
      {product.image_url ? (
        <Image src={product.image_url} alt={product.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      ) : <div className="grid h-full place-items-center text-cream">Sin imagen</div>}
      <span className="absolute left-3 top-3 rounded-md bg-char/90 px-2.5 py-1 text-xs font-black uppercase text-mustard">{product.is_available ? "Disponible" : "Agotada"}</span>
    </div>
  );

  const content = (
    <div className="flex flex-1 flex-col justify-center space-y-5 p-6 sm:p-8 lg:p-10">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-black sm:text-2xl">{product.name}</h3>
          <p className="shrink-0 text-lg font-black text-ember">{formatCOP(product.price)}</p>
        </div>
        <p className="mt-2 min-h-12 text-sm leading-6 text-cream/65">{product.description}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button disabled={!product.is_available} onClick={addToCart} className="flex items-center justify-center gap-2 rounded-md border border-cream/80 px-3 py-3 text-sm font-black text-cream transition hover:border-mustard hover:text-mustard disabled:cursor-not-allowed disabled:opacity-50">
          <ShoppingBasket size={17} /> Agregar
        </button>
        <Link href="/checkout" onClick={orderNow} className="flex items-center justify-center gap-2 rounded-md bg-ember px-3 py-3 text-sm font-black text-white transition hover:bg-char">
          <Zap size={17} /> Ordenar
        </Link>
      </div>
    </div>
  );

  return (
    <article className={`group overflow-hidden rounded-lg border-2 border-char/10 bg-surface shadow-sm transition hover:border-ember hover:shadow-xl ${variant === "diagonal" ? `flex flex-col lg:min-h-80 lg:flex-row ${reverse ? "lg:flex-row-reverse" : ""}` : ""}`}>
      {image}
      {content}
    </article>
  );
}


