"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

const createProductSchema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre del producto."),
  description: z.string().trim().min(5, "Escribe una descripción para el producto."),
  price: z.coerce.number().int().min(0, "El precio no puede ser negativo."),
  imageUrl: z.union([z.string().trim().url("La imagen debe ser una URL válida."), z.literal("")]),
  isAvailable: z.boolean(),
  isFeatured: z.boolean()
});

export type CreateProductResult =
  | { ok: true; productId: string }
  | { ok: false; message: string };

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 75);
}

export async function createProductAction(input: unknown): Promise<CreateProductResult> {
  if (!getSupabaseBrowserEnv()) {
    return { ok: false, message: "Configura Supabase antes de crear productos reales." };
  }

  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revisa los datos del producto." };
  }

  const supabase = createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return { ok: false, message: "No tienes permisos para crear productos." };
  }

  const baseSlug = slugify(parsed.data.name);
  if (!baseSlug) {
    return { ok: false, message: "El nombre debe incluir letras o números." };
  }

  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();
  const slug = existing ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}` : baseSlug;

  type ProductInsertQuery = {
    insert: (values: Database["public"]["Tables"]["products"]["Insert"]) => {
      select: (columns: "id") => {
        single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };

  const productsTable = supabase.from("products") as unknown as ProductInsertQuery;
  const { data, error } = await productsTable
    .insert({
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      image_url: parsed.data.imageUrl || null,
      is_available: parsed.data.isAvailable,
      is_featured: parsed.data.isFeatured
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("create product failed", error);
    return { ok: false, message: "No pudimos guardar el producto. Revisa los datos e inténtalo nuevamente." };
  }

  revalidatePath("/menu");
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, productId: data.id };
}
