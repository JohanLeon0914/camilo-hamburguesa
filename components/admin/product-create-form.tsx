"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { createProductAction } from "@/app/actions/products";
import { createClient } from "@/lib/supabase/client";

const initialForm = {
  name: "",
  description: "",
  price: "",
  isAvailable: true,
  isFeatured: false
};

export function ProductCreateForm({ setupMissing = false }: { setupMissing?: boolean }) {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      let imageUrl = "";

      if (imageFile) {
        if (!imageFile.type.startsWith("image/")) {
          toast.error("Selecciona un archivo de imagen válido.");
          return;
        }
        if (imageFile.size > 5 * 1024 * 1024) {
          toast.error("La imagen no puede superar los 5 MB.");
          return;
        }

        const supabase = createClient();
        const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `products/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, imageFile, {
          cacheControl: "3600",
          contentType: imageFile.type,
          upsert: false
        });

        if (uploadError) {
          toast.error("No se pudo subir la imagen. Verifica el bucket de Supabase.");
          return;
        }
        imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }

      const result = await createProductAction({ ...form, imageUrl });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setForm(initialForm);
      setImageFile(null);
      router.refresh();
      toast.success("Producto agregado al menú", {
    position: "bottom-center" // Valores: top-right, top-center, top-left, bottom-right, bottom-center, bottom-left
});
    });
  }

  return (
    <section className="rounded-lg border border-char/10 bg-paper p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-mustard p-2 text-char"><ImagePlus size={20} /></div>
        <div>
          <h2 className="text-xl font-black">Agregar producto</h2>
          <p className="mt-1 text-sm text-cream/65">El producto aparecerá en el menú cuando lo guardes.</p>
        </div>
      </div>

      {setupMissing ? (
        <p className="mt-5 rounded-md bg-mustard p-3 text-sm font-bold text-char">Configura Supabase para guardar productos reales.</p>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nombre" value={form.name} onChange={(value) => updateField("name", value)} placeholder="Ej. BBQ Burger" required />
          <Field label="Precio (COP)" type="number" min="0" step="1" value={form.price} onChange={(value) => updateField("price", value)} placeholder="25000" required />
          <label>
            <span className="mb-1 block text-sm font-bold">Imagen del producto</span>
            <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="w-full rounded-md border border-char/15 bg-white px-3 py-2 text-sm text-black file:mr-3 file:rounded-md file:border-0 file:bg-char file:px-3 file:py-1.5 file:font-bold file:text-white" />
            <span className="mt-1 block text-xs text-cream/60">JPG, PNG, WEBP o GIF. Máximo 5 MB.</span>
          </label>
          <div className="flex items-end gap-5 pb-2 text-sm font-bold">
            <Checkbox label="Disponible" checked={form.isAvailable} onChange={(value) => updateField("isAvailable", value)} />
            <Checkbox label="Destacado" checked={form.isFeatured} onChange={(value) => updateField("isFeatured", value)} />
          </div>
          <label className="md:col-span-2">
            <span className="mb-1 block text-sm font-bold">Descripción</span>
            <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Describe los ingredientes del producto" rows={3} required className="w-full rounded-md border border-char/15 px-3 py-2 text-black" />
          </label>
          <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-md bg-ember px-4 py-3 font-black text-white transition hover:bg-char disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
            <Plus size={18} />
            {isPending ? "Guardando..." : "Guardar producto"}
          </button>
        </form>
      )}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", min, step, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; min?: string; step?: string; required?: boolean }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-bold">{label}</span>
      <input type={type} min={min} step={step} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="w-full rounded-md border border-char/15 px-3 py-2 text-black" />
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="inline-flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}
