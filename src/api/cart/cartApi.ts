import { api } from "@/api/client";
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
  const response = await api.get("/cart");
  return cartSchema.parse(response.data);
}

/* Add an item to the authenticated user's cart and return the updated cart. */
export async function addItemToCart(values: UpdateCartInput) {
  const response = await api.post("/cart/add", values);
  return cartSchema.parse(response.data);
}

/* Update quantity for one cart item and return the updated cart. */
export async function updateCartItem(values: UpdateCartInput) {
  const response = await api.put("/cart/update", values);
  return cartSchema.parse(response.data);
}

/* Remove one item from the authenticated user's cart. */
export async function removeCartItem(values: RemoveCartItemInput) {
  const response = await api.delete("/cart/remove", {
    data: values,
  });
  return cartSchema.parse(response.data);
}

/* Remove every item from the authenticated user's cart. */
export async function clearCartRequest() {
  const response = await api.delete("/cart/clear");
  return cartSchema.parse(response.data);
}
