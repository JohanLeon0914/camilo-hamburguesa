"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Home, Loader2, Plus, TicketPercent } from "lucide-react";
import { createOrderAction } from "@/app/actions/orders";
import type { Database } from "@/lib/supabase/database.types";
import { calculateOrderTotal, getLoyaltyStatus } from "@/lib/order-calculations";
import { formatCOP } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

type Address = Database["public"]["Tables"]["addresses"]["Row"];

export function CheckoutClient({
  addresses,
  loyalty,
  setupMissing = false
}: {
  addresses: Address[];
  loyalty: { delivered: number; consumed: number };
  setupMissing?: boolean;
}) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id ?? "");
  const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
  const [isPending, startTransition] = useTransition();
  const status = getLoyaltyStatus(loyalty.delivered, loyalty.consumed);
  const totals = useMemo(
    () => calculateOrderTotal(items, status.hasAvailableReward ? 10 : 0),
    [items, status.hasAvailableReward]
  );

  const canCreateNewAddress = addresses.length < 3;

  function submit(formData: FormData) {
    const address = useNewAddress
      ? {
          label: String(formData.get("label") ?? "Casa"),
          recipientName: String(formData.get("recipientName") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          address: String(formData.get("address") ?? ""),
          addressDetails: String(formData.get("addressDetails") ?? "")
        }
      : undefined;

    startTransition(async () => {
      const result = await createOrderAction({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        addressId: useNewAddress ? undefined : selectedAddressId,
        address
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      clearCart();
      toast.success("Pedido recibido");
      router.push(`/orders/${result.orderId}`);
    });
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black">Tu carrito está vacío</h1>
        <p className="mt-3 text-cream/65">Agrega una hamburguesa antes de confirmar el pedido.</p>
        <Link href="/menu" className="mt-6 inline-flex rounded-md bg-ember px-5 py-3 font-black text-white">Ver menú</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <form action={submit} className="space-y-6">
        <div>
          <p className="font-black uppercase text-ember">Checkout</p>
          <h1 className="mt-2 text-4xl font-black">Confirma tu pedido</h1>
          {setupMissing && <p className="mt-3 rounded-md bg-mustard px-3 py-2 text-sm font-bold">Falta configurar Supabase para crear pedidos reales.</p>}
        </div>

        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">Dirección de entrega</h2>
            {!useNewAddress && canCreateNewAddress && (
              <button type="button" onClick={() => setUseNewAddress(true)} className="flex items-center gap-2 font-bold text-ember">
                <Plus size={17} /> Nueva
              </button>
            )}
          </div>

          {!useNewAddress && addresses.length > 0 ? (
            <div className="grid gap-3">
              {addresses.map((address) => (
                <label key={address.id} className="flex cursor-pointer gap-3 rounded-md border border-char/10 p-4 has-[:checked]:border-ember has-[:checked]:bg-red-50 text-black">
                  <input
                    type="radio"
                    name="addressId"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <span className="text-black">
                    <span className="flex items-center gap-2 font-black"><Home size={16} /> {address.label}</span>
                    <span className="mt-1 block text-sm text-black">{address.recipient_name} {address.phone}</span>
                    <span className="block text-sm text-black">{address.address}</span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="recipientName" label="Nombre" placeholder="Johan" />
              <Field name="phone" label="Celular" placeholder="300 000 0000" />
              <Field name="address" label="Dirección" placeholder="Calle 10 # 20-30" />
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-bold">Información adicional</span>
                <textarea name="addressDetails" rows={3} className="w-full rounded-md border border-char/15 px-3 py-2" placeholder="Apartamento, barrio, referencia o notas de entrega" />
              </label>
              {addresses.length > 0 && (
                <button type="button" onClick={() => setUseNewAddress(false)} className="text-left font-bold text-ember">
                  Usar una dirección guardada
                </button>
              )}
              {!canCreateNewAddress && (
                <p className="sm:col-span-2 rounded-md bg-mustard px-3 py-2 text-sm font-bold">Ya tienes 3 direcciones. Edita o elimina una para crear otra.</p>
              )}
            </div>
          )}
        </div>

        <button
          disabled={isPending || setupMissing || (!useNewAddress && !selectedAddressId)}
          className="w-full rounded-md bg-ember px-5 py-4 font-black text-white transition hover:bg-char disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Creando pedido...</span> : "Confirmar pedido"}
        </button>
      </form>

      <aside className="h-fit rounded-lg bg-char p-5 text-cream shadow-glow">
        <h2 className="text-xl font-black">Tu pedido</h2>
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-4 border-b border-cream/10 pb-3 text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span className="font-black">{formatCOP(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 text-sm">
          <Row label="Subtotal" value={formatCOP(totals.subtotal)} />
          <Row label="Descuento" value={`-${formatCOP(totals.discountAmount)}`} />
          <Row label="Total" value={formatCOP(totals.total)} strong />
        </div>
        <div className="mt-5 rounded-md bg-cream/10 p-4">
          <p className="flex items-center gap-2 font-black text-mustard"><TicketPercent size={18} /> Fidelidad</p>
          <p className="mt-2 text-sm text-cream/75">
            {status.hasAvailableReward
              ? "Tienes 10% de descuento disponible en este pedido."
              : `${status.progress} de 3 pedidos. Te faltan ${status.remaining} para ganar 10%.`}
          </p>
        </div>
      </aside>
    </section>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-bold">{label}</span>
      <input name={name} className="w-full rounded-md border border-char/15 px-3 py-2 text-black" placeholder={placeholder} />
    </label>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-cream/15 pt-3 text-xl font-black" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

