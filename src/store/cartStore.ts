import { toast } from "sonner";
import { create } from "zustand";

import {
  addItemToCart,
  clearCartRequest,
  fetchCart as fetchServerCart,
  removeCartItem,
  updateCartItem,
} from "@/api";
import { debounce } from "@/lib/debounce";
import type { CartItem, Product, ServerCart } from "@/types";

type CartStore = {
  items: CartItem[];
  isLoading: boolean;
  isSaving: boolean;
  fetchCart: () => Promise<void>;
  addProduct: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  resetCart: () => void;
};

type PendingQuantitySync = ReturnType<typeof debounce<[number, CartItem[]]>>;
type PendingQuantityMap = Record<string, PendingQuantitySync>;

const pendingQuantityTimers: PendingQuantityMap = {};

const clearPendingQuantityTimers = () => {
  Object.values(pendingQuantityTimers).forEach((pendingSync) => {
    pendingSync.cancel();
  });

  Object.keys(pendingQuantityTimers).forEach((productId) => {
    delete pendingQuantityTimers[productId];
  });
};

const mapServerCartItems = (cart: ServerCart): CartItem[] =>
  cart.items
    .filter((item): item is typeof item & { product: NonNullable<typeof item.product> } => {
      return item.product !== null;
    })
    .map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: item.product,
    }))
    .sort((left, right) => left.product.title.localeCompare(right.product.title));

const updateOptimisticQuantity = (items: CartItem[], productId: string, quantity: number) =>
  items
    .map((item) =>
      item.product.id === productId
        ? { ...item, quantity: Math.max(0, quantity) }
        : item,
    )
    .filter((item) => item.quantity > 0);

const setCartFromServer = (set: (partial: Partial<CartStore>) => void, cart: ServerCart) => {
  set({ items: mapServerCartItems(cart), isSaving: false });
};

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  isLoading: false,
  isSaving: false,
  fetchCart: async () => {
    set({ isLoading: true });

    try {
      const cart = await fetchServerCart();
      set({ items: mapServerCartItems(cart), isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  addProduct: async (product, quantity = 1) => {
    const previousItems = get().items;
    const existingItem = previousItems.find((item) => item.product.id === product.id);
    const optimisticItems = existingItem
      ? previousItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [
          ...previousItems,
          {
            id: crypto.randomUUID(),
            product,
            quantity,
          },
        ];

    set({ items: optimisticItems, isSaving: true });

    try {
      const cart = await addItemToCart({
        foodItemId: product.id,
        quantity,
      });
      setCartFromServer(set, cart);
      toast.success(`${product.title} added to cart`);
    } catch (error) {
      set({ items: previousItems, isSaving: false });
      toast.error(error instanceof Error ? error.message : "Could not update cart");
    }
  },
  updateQuantity: async (productId, quantity) => {
    const previousItems = get().items;
    const optimisticItems = updateOptimisticQuantity(previousItems, productId, quantity);

    set({ items: optimisticItems, isSaving: true });

    let debouncedSync = pendingQuantityTimers[productId];

    if (!debouncedSync) {
      debouncedSync = debounce(async (nextQuantity, rollbackItems) => {
        delete pendingQuantityTimers[productId];

        try {
          const cart =
            nextQuantity <= 0
              ? await removeCartItem({ foodItemId: productId })
              : await updateCartItem({ foodItemId: productId, quantity: nextQuantity });
          setCartFromServer(set, cart);
        } catch (error) {
          set({ items: rollbackItems, isSaving: false });
          toast.error(error instanceof Error ? error.message : "Could not update cart");
        }
      });

      pendingQuantityTimers[productId] = debouncedSync;
    }

    debouncedSync(quantity, previousItems);
  },
  removeProduct: async (productId) => {
    const pendingSync = pendingQuantityTimers[productId];

    if (pendingSync) {
      pendingSync.cancel();
      delete pendingQuantityTimers[productId];
    }

    const previousItems = get().items;
    const optimisticItems = previousItems.filter((item) => item.product.id !== productId);

    set({ items: optimisticItems, isSaving: true });

    try {
      const cart = await removeCartItem({ foodItemId: productId });
      setCartFromServer(set, cart);
    } catch (error) {
      set({ items: previousItems, isSaving: false });
      toast.error(error instanceof Error ? error.message : "Could not update cart");
    }
  },
  clearAll: async () => {
    clearPendingQuantityTimers();

    const previousItems = get().items;
    set({ items: [], isSaving: true });

    try {
      const cart = await clearCartRequest();
      setCartFromServer(set, cart);
    } catch (error) {
      set({ items: previousItems, isSaving: false });
      toast.error(error instanceof Error ? error.message : "Could not clear cart");
    }
  },
  resetCart: () => {
    clearPendingQuantityTimers();

    set({ items: [], isLoading: false, isSaving: false });
  },
}));

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
