import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];

const previewProducts: Product[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Classic Burger",
    slug: "classic-burger",
    description: "Carne smash, cheddar, pepinillos, cebolla grillada y salsa Camilo.",
    price: 22000,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop",
    is_available: true,
    is_featured: true,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Bacon Burger",
    slug: "bacon-burger",
    description: "Doble queso cheddar, tocineta crocante, cebolla caramelizada y salsa ahumada.",
    price: 28000,
    image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
    is_available: true,
    is_featured: true,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Double Cheese",
    slug: "double-cheese",
    description: "Doble carne, doble cheddar, pan brioche tostado y pepinillos frescos.",
    price: 32000,
    image_url: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1200&auto=format&fit=crop",
    is_available: true,
    is_featured: false,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function getProducts() {
  if (!getSupabaseBrowserEnv()) {
    return { products: previewProducts, isPreview: true, error: null };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("archived_at", null)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });

  return { products: data ?? [], isPreview: false, error };
}
