import { ProductGrid } from "@/components/menu/product-grid";
import { getProducts } from "@/lib/products";

export default async function MenuPage() {
  const { products, isPreview } = await getProducts();

  return (
    <section className="bg-char px-4 py-12 text-cream sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="font-black uppercase text-mustard">Menu digital</p>
      </div>
      <div className="mx-auto mt-10 max-w-7xl rounded-lg bg-paper p-3 text-cream sm:p-5 lg:p-8">
        <ProductGrid products={products} layout="diagonal" />
      </div>
    </section>
  );
}
