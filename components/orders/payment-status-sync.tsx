"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { confirmMercadoPagoPaymentAction } from "@/app/actions/orders";

export function PaymentStatusSync({ orderId, paymentId, initialPaid }: { orderId: string; paymentId?: string; initialPaid: boolean }) {
  const [paid, setPaid] = useState(initialPaid);

  useEffect(() => {
    if (!paymentId || paid) return;
    let active = true;
    let attempts = 0;
    const check = async () => {
      const result = await confirmMercadoPagoPaymentAction(orderId, paymentId);
      if (active && result.paid) setPaid(true);
    };
    void check();
    const timer = window.setInterval(() => {
      attempts += 1;
      if (attempts >= 20) window.clearInterval(timer);
      else void check();
    }, 3000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [orderId, paid, paymentId]);

  if (!paymentId) return null;
  if (paid) return <p className="mt-5 rounded-md bg-green-100 px-4 py-3 font-bold text-green-900">Pago confirmado correctamente.</p>;
  return <p className="mt-5 inline-flex w-full items-center gap-2 rounded-md bg-mustard px-4 py-3 font-bold text-char"><Loader2 size={18} className="animate-spin" /> Mercado Pago recibió tu pago. Validando confirmación…</p>;
}
