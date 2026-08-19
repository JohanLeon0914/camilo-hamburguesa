"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((cartItem) => cartItem.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.productId === item.productId
                  ? { ...cartItem, quantity: Math.min(cartItem.quantity + quantity, 20) }
                  : cartItem
              ),
              isOpen: state.isOpen
            };
          }
          return { items: [...state.items, { ...item, quantity }], isOpen: state.isOpen };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((item) => item.productId !== productId)
            : state.items.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(quantity, 20) } : item))
        })),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      subtotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      itemCount: () => get().items.reduce((total, item) => total + item.quantity, 0)
    }),
    { name: "camilo-cart-v1", partialize: (state) => ({ items: state.items }) }
  )
);
