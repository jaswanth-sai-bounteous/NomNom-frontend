import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem } from "@/types";

type CartStore = {
  ownerUserId: string | null;
  items: CartItem[];
  setOwner: (userId: string) => void;
  setItems: (items: CartItem[]) => void;
  addItemLocally: (item: CartItem) => void;
  updateQuantityLocally: (productId: string, quantity: number) => void;
  removeItemLocally: (productId: string) => void;
  clearCart: () => void;
  resetCartForLogout: () => void;
};

/*
  This store keeps the latest cart data for the currently signed-in user.
  We still persist it for a smoother refresh experience, but we always scope it
  to `ownerUserId` so one user's local cart never appears for another user.
*/
export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      ownerUserId: null,
      items: [],
      setOwner: (userId) =>
        set((state) => {
          if (state.ownerUserId && state.ownerUserId !== userId) {
            return {
              ownerUserId: userId,
              items: [],
            };
          }

          return {
            ownerUserId: userId,
          };
        }),
      setItems: (items) => set({ items }),
      addItemLocally: (newItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === newItem.product.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === newItem.product.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, newItem],
          };
        }),
      updateQuantityLocally: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: Math.max(0, quantity) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      removeItemLocally: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),
      clearCart: () => set({ items: [] }),
      resetCartForLogout: () => set({ ownerUserId: null, items: [] }),
    }),
    {
      name: "nomnom-cart",
    },
  ),
);

/*
  Input: full cart items array from Zustand.
  Output: total number of units across the whole cart.
  Example: 2 burgers + 3 fries returns 5.
*/
export const getCartQuantityTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

/*
  Input: full cart items array from Zustand.
  Output: number of different products in the cart.
  Example: burgers + fries returns 2.
*/
export const getCartProductCount = (items: CartItem[]) => items.length;
