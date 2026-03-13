import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addItemToCart,
  clearCartRequest,
  removeCartItem,
  updateCartItem,
} from "@/api";
import { syncCartFromServer } from "@/lib/storeSync";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

type PendingQuantityMap = Record<string, ReturnType<typeof setTimeout>>;
type RequestVersionMap = Record<string, number>;

/*
  This hook keeps cart interactions feeling instant for the user.
  Input: product ids, quantities, or whole products.
  Output: helper functions that update the local UI immediately and then sync with the server.
*/
export const useCartActions = () => {
  const addItemLocally = useCartStore((state) => state.addItemLocally);
  const updateQuantityLocally = useCartStore((state) => state.updateQuantityLocally);
  const removeItemLocally = useCartStore((state) => state.removeItemLocally);
  const clearCart = useCartStore((state) => state.clearCart);
  const pendingQuantityTimersRef = useRef<PendingQuantityMap>({});
  const requestVersionsRef = useRef<RequestVersionMap>({});
  const cartActionVersionRef = useRef(0);

  const addMutation = useMutation({
    mutationFn: ({ product, quantity }: { product: Product; quantity: number }) =>
      addItemToCart({
        foodItemId: product.id,
        quantity,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) =>
      updateCartItem({
        foodItemId: productId,
        quantity,
      }),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeCartItem({ foodItemId: productId }),
  });

  const clearMutation = useMutation({
    mutationFn: clearCartRequest,
  });

  /*
    Input: product id.
    Output: current quantity in the local Zustand cart.
  */
  const getLocalQuantity = useCallback((productId: string) => {
    const existingItem = useCartStore
      .getState()
      .items.find((item) => item.product.id === productId);

    return existingItem?.quantity ?? 0;
  }, []);

  /*
    Input: product id.
    Output: a new version number used to ignore older request responses.
  */
  const createRequestVersion = useCallback((productId: string) => {
    const nextVersion = (requestVersionsRef.current[productId] ?? 0) + 1;
    requestVersionsRef.current[productId] = nextVersion;
    return nextVersion;
  }, []);

  /*
    Input: product id + request version.
    Output: true only when this is still the newest request for that product.
  */
  const isLatestRequest = useCallback((productId: string, version: number) => {
    return requestVersionsRef.current[productId] === version;
  }, []);

  /*
    Input: none.
    Output: a single cart-wide action version.
    We use this to ignore older mutation responses that finish after newer clicks.
  */
  const createCartActionVersion = useCallback(() => {
    cartActionVersionRef.current += 1;
    return cartActionVersionRef.current;
  }, []);

  /*
    Input: one cart-wide action version.
    Output: true only for the newest cart mutation we have started.
  */
  const isLatestCartAction = useCallback((version: number) => {
    return cartActionVersionRef.current === version;
  }, []);

  /*
    Input: product id + final quantity the UI should keep.
    Output: sends one debounced server update after rapid button clicks settle.
  */
  const scheduleQuantitySync = useCallback(
    (productId: string, quantity: number, rollbackItems = useCartStore.getState().items) => {
      const existingTimer = pendingQuantityTimersRef.current[productId];

      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      pendingQuantityTimersRef.current[productId] = setTimeout(async () => {
        delete pendingQuantityTimersRef.current[productId];
        const requestVersion = createRequestVersion(productId);
        const cartActionVersion = createCartActionVersion();

        try {
          const cart =
            quantity <= 0
              ? await removeMutation.mutateAsync(productId)
              : await updateMutation.mutateAsync({ productId, quantity });

          if (
            isLatestRequest(productId, requestVersion) &&
            isLatestCartAction(cartActionVersion)
          ) {
            syncCartFromServer(cart);
          }
        } catch (error) {
          if (
            isLatestRequest(productId, requestVersion) &&
            isLatestCartAction(cartActionVersion)
          ) {
            useCartStore.getState().setItems(rollbackItems);
            toast.error(error instanceof Error ? error.message : "Could not update cart");
          }
        }
      }, 220);
    },
    [
      createCartActionVersion,
      createRequestVersion,
      isLatestCartAction,
      isLatestRequest,
      removeMutation,
      updateMutation,
    ],
  );

  /*
    Input: product + quantity to add.
    Output: updates the local cart immediately and then syncs the backend.
  */
  const addProduct = useCallback(
    async (product: Product, quantity = 1) => {
      const previousItems = useCartStore.getState().items;
      const existingQuantity = getLocalQuantity(product.id);
      const successMessage = `${product.title} added to cart`;

      addItemLocally({
        id: crypto.randomUUID(),
        product,
        quantity,
      });

      toast.success(successMessage);

      if (existingQuantity > 0) {
        scheduleQuantitySync(product.id, existingQuantity + quantity, previousItems);
        return;
      }

      const requestVersion = createRequestVersion(product.id);
      const cartActionVersion = createCartActionVersion();

      try {
        const cart = await addMutation.mutateAsync({ product, quantity });

        if (
          isLatestRequest(product.id, requestVersion) &&
          isLatestCartAction(cartActionVersion)
        ) {
          syncCartFromServer(cart);
        }
      } catch (error) {
        if (
          isLatestRequest(product.id, requestVersion) &&
          isLatestCartAction(cartActionVersion)
        ) {
          useCartStore.getState().setItems(previousItems);
          toast.error(error instanceof Error ? error.message : "Could not update cart");
        }
      }
    },
    [
      addItemLocally,
      addMutation,
      createCartActionVersion,
      createRequestVersion,
      getLocalQuantity,
      isLatestCartAction,
      isLatestRequest,
      scheduleQuantitySync,
    ],
  );

  /*
    Input: product id + new quantity from the buttons.
    Output: local cart changes immediately, while server syncing is debounced.
  */
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const previousItems = useCartStore.getState().items;
      updateQuantityLocally(productId, quantity);
      scheduleQuantitySync(productId, quantity, previousItems);
    },
    [scheduleQuantitySync, updateQuantityLocally],
  );

  /*
    Input: product id.
    Output: removes the item locally right away and then confirms with the backend.
  */
  const removeProduct = useCallback(
    async (productId: string) => {
      const existingTimer = pendingQuantityTimersRef.current[productId];

      if (existingTimer) {
        clearTimeout(existingTimer);
        delete pendingQuantityTimersRef.current[productId];
      }

      const previousItems = useCartStore.getState().items;
      const requestVersion = createRequestVersion(productId);
      const cartActionVersion = createCartActionVersion();

      removeItemLocally(productId);

      try {
        const cart = await removeMutation.mutateAsync(productId);

        if (
          isLatestRequest(productId, requestVersion) &&
          isLatestCartAction(cartActionVersion)
        ) {
          syncCartFromServer(cart);
        }
      } catch (error) {
        if (
          isLatestRequest(productId, requestVersion) &&
          isLatestCartAction(cartActionVersion)
        ) {
          useCartStore.getState().setItems(previousItems);
          toast.error(error instanceof Error ? error.message : "Could not update cart");
        }
      }
    },
    [
      createCartActionVersion,
      createRequestVersion,
      isLatestCartAction,
      isLatestRequest,
      removeItemLocally,
      removeMutation,
    ],
  );

  /*
    Input: none.
    Output: clears the full cart locally and then syncs the backend.
  */
  const clearAll = useCallback(async () => {
    Object.values(pendingQuantityTimersRef.current).forEach((timer) => {
      clearTimeout(timer);
    });
    pendingQuantityTimersRef.current = {};

    const previousItems = useCartStore.getState().items;
    const cartActionVersion = createCartActionVersion();
    clearCart();

    try {
      const cart = await clearMutation.mutateAsync();
      if (isLatestCartAction(cartActionVersion)) {
        syncCartFromServer(cart);
      }
    } catch (error) {
      if (isLatestCartAction(cartActionVersion)) {
        useCartStore.getState().setItems(previousItems);
        toast.error(error instanceof Error ? error.message : "Could not clear cart");
      }
    }
  }, [clearCart, clearMutation, createCartActionVersion, isLatestCartAction]);

  useEffect(() => {
    return () => {
      Object.values(pendingQuantityTimersRef.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  return {
    addProduct,
    updateQuantity,
    removeProduct,
    clearAll,
    isSaving:
      addMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      clearMutation.isPending,
  };
};
