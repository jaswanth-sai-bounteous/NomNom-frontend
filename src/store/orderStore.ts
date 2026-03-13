import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ServerOrder } from "@/types";

type OrderStore = {
  ownerUserId: string | null;
  orders: ServerOrder[];
  setOwner: (userId: string) => void;
  setOrders: (orders: ServerOrder[]) => void;
  addOrder: (order: ServerOrder) => void;
  clearOrders: () => void;
  resetOrdersForLogout: () => void;
};

/*
  This store mirrors server orders for the currently authenticated user.
  The `ownerUserId` check prevents one user's history from leaking into another
  user's session on the same browser.
*/
export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      ownerUserId: null,
      orders: [],
      setOwner: (userId) =>
        set((state) => {
          if (state.ownerUserId && state.ownerUserId !== userId) {
            return {
              ownerUserId: userId,
              orders: [],
            };
          }

          return {
            ownerUserId: userId,
          };
        }),
      setOrders: (orders) => set({ orders }),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      clearOrders: () => set({ orders: [] }),
      resetOrdersForLogout: () => set({ ownerUserId: null, orders: [] }),
    }),
    {
      name: "nomnom-orders",
    },
  ),
);
