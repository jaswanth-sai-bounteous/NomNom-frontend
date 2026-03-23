import { api } from "@/api/client";
import { messageResponseSchema } from "@/types/api";
import { checkoutResponseSchema, ordersResponseSchema } from "@/types/order";

type CheckoutInput = {
  shippingAddress: string;
  paymentMethod: string;
};

/* Fetch only the currently authenticated user's orders. */
export async function fetchOrders() {
  const response = await api.get("/orders");
  return ordersResponseSchema.parse(response.data).orders;
}

/* Create a real backend order using the current user's cart. */
export async function checkoutOrder(values: CheckoutInput) {
  const response = await api.post("/orders/checkout", values);

  return checkoutResponseSchema.parse(response.data).order;
}

export async function clearOrdersRequest() {
  const response = await api.delete("/orders");
  return messageResponseSchema.parse(response.data);
}
