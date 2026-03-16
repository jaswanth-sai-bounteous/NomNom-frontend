import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ServerOrder } from "@/types";

type OrderStore = {
  ownerUserId: string | null;
  orders: ServerOrder[];
  hasLoadedFromServer: boolean;
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
      hasLoadedFromServer: false,
      setOwner: (userId) =>
        set({
          ownerUserId: userId,
          orders: [],
          hasLoadedFromServer: false,
        }),
      setOrders: (orders) => set({ orders, hasLoadedFromServer: true }),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
          hasLoadedFromServer: true,
        })),
      clearOrders: () => set({ orders: [] }),
      resetOrdersForLogout: () =>
        set({ ownerUserId: null, orders: [], hasLoadedFromServer: false }),
    }),
    {
      name: "nomnom-orders",
      partialize: (state) => ({
        ownerUserId: state.ownerUserId,
        orders: state.orders,
      }),
    },
  ),
);
