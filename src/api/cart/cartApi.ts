import { requestJson } from "@/api/client";
import { cartSchema } from "@/types/cart";

type UpdateCartInput = {
  foodItemId: string;
  quantity: number;
};

type RemoveCartItemInput = {
  foodItemId: string;
};

/* Get the currently authenticated user's cart from the backend. */
export async function fetchCart() {
  return requestJson("/cart", cartSchema);
}

/* Add an item to the authenticated user's cart and return the updated cart. */
export async function addItemToCart(values: UpdateCartInput) {
  return requestJson(
    "/cart/add",
    cartSchema,
    {
      method: "POST",
      body: JSON.stringify(values),
    },
  );
}

/* Update quantity for one cart item and return the updated cart. */
export async function updateCartItem(values: UpdateCartInput) {
  return requestJson(
    "/cart/update",
    cartSchema,
    {
      method: "PUT",
      body: JSON.stringify(values),
    },
  );
}

/* Remove one item from the authenticated user's cart. */
export async function removeCartItem(values: RemoveCartItemInput) {
  return requestJson(
    "/cart/remove",
    cartSchema,
    {
      method: "DELETE",
      body: JSON.stringify(values),
    },
  );
}

/* Remove every item from the authenticated user's cart. */
export async function clearCartRequest() {
  return requestJson(
    "/cart/clear",
    cartSchema,
    {
      method: "DELETE",
    },
  );
}
