export type PricedItem = {
  price: number;
  quantity: number;
};

export function calculateSubtotal(items: PricedItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function calculateDiscount(subtotal: number, percentage: number) {
  if (percentage <= 0) return 0;
  return Math.round(subtotal * (percentage / 100));
}

export function calculateOrderTotal(items: PricedItem[], discountPercentage: number) {
  const subtotal = calculateSubtotal(items);
  const discountAmount = calculateDiscount(subtotal, discountPercentage);

  return {
    subtotal,
    discountAmount,
    total: Math.max(subtotal - discountAmount, 0)
  };
}

export function getLoyaltyStatus(deliveredOrders: number, consumedRewards: number) {
  const earnedRewards = Math.floor(deliveredOrders / 3);
  const availableRewards = Math.max(earnedRewards - consumedRewards, 0);
  const progress = deliveredOrders % 3;

  return {
    deliveredOrders,
    consumedRewards,
    availableRewards,
    hasAvailableReward: availableRewards > 0,
    progress,
    remaining: availableRewards > 0 ? 0 : 3 - progress
  };
}
