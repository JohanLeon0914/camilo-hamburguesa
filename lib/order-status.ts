import type { Database } from "@/lib/supabase/database.types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  preparing: "En preparación",
  ready: "Listo para entregar",
  delivered: "Entregado",
  cancelled: "Cancelado"
};

export function getOrderStatusLabel(status: OrderStatus) {
  return orderStatusLabels[status] ?? status;
}
