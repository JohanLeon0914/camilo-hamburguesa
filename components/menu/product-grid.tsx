import type { Product } from "@/lib/products";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, layout = "grid" }: { products: Product[]; layout?: "grid" | "diagonal" }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-cream/20 bg-surface p-8 text-center text-cream">
        <h2 className="text-xl font-black">No hay hamburguesas disponibles</h2>
        <p className="mt-2 text-cream/60">Cuando se carguen productos en Supabase apareceran aqui.</p>
      </div>
    );
  }

  if (layout === "diagonal") {
    return (
      <div className="space-y-5 lg:space-y-8">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} variant="diagonal" reverse={index % 2 === 1} />
        ))}
      </div>
    );
  }

  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}


