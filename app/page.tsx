import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, Medal, Timer } from "lucide-react";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { products, isPreview } = await getProducts();
  const featured = products.find((product) => product.is_featured) ?? products[0];

  return <div>
    {isPreview && <div className="bg-mustard px-4 py-2 text-center text-sm font-bold text-char">Vista previa con datos locales. Configura Supabase y ejecuta las migraciones para usar datos reales.</div>}
    <section className="relative min-h-[78vh] overflow-hidden bg-char text-cream">
      <div className="absolute inset-0 opacity-35">{featured?.image_url && <Image src={featured.image_url} alt="" fill priority sizes="100vw" className="object-cover" />}</div>
      <div className="absolute inset-0 bg-gradient-to-r from-char via-char/85 to-ember/35" />
      <div className="relative mx-auto grid min-h-[78vh] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-mustard px-3 py-1 text-sm font-black uppercase text-char"><Flame size={16} /> Smash burgers calientes</p>
          <h1 className="text-balance text-5xl font-black leading-none sm:text-7xl">Camilo Hamburguesas</h1>
          <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-cream/78">Hamburguesas directas, intensas y hechas para volver.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-md bg-ember px-6 py-4 font-black text-white transition hover:bg-mustard hover:text-char">Ver menú <ArrowRight size={18} /></Link><Link href="/orders" className="inline-flex items-center justify-center rounded-md border border-cream/25 px-6 py-4 font-black text-cream transition hover:bg-cream hover:text-char">Mis órdenes</Link></div>
        </div>
        <div className="hidden self-end lg:block"><div className="grid grid-cols-3 gap-3 rounded-lg border border-cream/15 bg-char/70 p-3 backdrop-blur"><Stat icon={<Timer size={18} />} label="Pedido rápido" value="3 pasos" /><Stat icon={<Medal size={18} />} label="Fidelidad" value="10%" /><Stat icon={<Flame size={18} />} label="Menú en vivo" value="Tiempo real" /></div></div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-black uppercase text-ember">La carta</p><h2 className="text-3xl font-black sm:text-4xl">La mejor parte empieza aquí</h2></div><Link href="/menu" className="inline-flex items-center gap-2 rounded-md bg-ember px-5 py-3 font-black text-white hover:bg-char">Entrar al menú <ArrowRight size={18} /></Link></div>
      <div className="grid gap-4 sm:grid-cols-3"><Info number="01" title="Elige tu favorita" text="Una carta corta, pensada para pedir bien." tone="dark" /><Info number="02" title="Arma tu pedido" text="Guarda productos y ajusta cantidades." tone="red" /><Info number="03" title="Recibe la recompensa" text="Cada tres pedidos entregados desbloqueas 10%." tone="yellow" /></div>
    </section>
  </div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-md bg-char/70 p-4"><div className="mb-3 text-mustard">{icon}</div><p className="text-sm text-cream/65">{label}</p><p className="text-xl font-black">{value}</p></div>; }
function Info({ number, title, text, tone }: { number: string; title: string; text: string; tone: "dark" | "red" | "yellow" }) { const colors = { dark: "bg-char text-cream", red: "bg-ember text-white", yellow: "bg-mustard text-char" }; return <div className={`rounded-lg p-5 ${colors[tone]}`}><p className="text-3xl font-black text-mustard">{number}</p><p className="mt-3 font-black">{title}</p><p className="mt-1 text-sm opacity-70">{text}</p></div>; }
