import type { CartItem, ServerCart, ServerOrder, User } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";

const mapServerCartItems = (items: ServerCart["items"]): CartItem[] =>
  items
    .filter((item): item is typeof item & { product: NonNullable<typeof item.product> } => {
      return item.product !== null;
    })
    .map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product,
    }));

export const syncUserStores = (user: User) => {
  useCartStore.getState().setOwner(user.id);
  useOrderStore.getState().setOwner(user.id);
};

export const syncCartFromServer = (cart: ServerCart) => {
  useCartStore.getState().setItems(mapServerCartItems(cart.items));
};

export const syncOrdersFromServer = (orders: ServerOrder[]) => {
  const currentOrders = useOrderStore.getState().orders;

  // Avoid unnecessary store writes when the fetched server data is unchanged.
  if (JSON.stringify(currentOrders) === JSON.stringify(orders)) {
    return;
  }

  useOrderStore.getState().setOrders(orders);
};

export const clearUserStores = () => {
  useCartStore.getState().resetCartForLogout();
  useOrderStore.getState().resetOrdersForLogout();
};
