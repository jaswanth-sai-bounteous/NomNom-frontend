import { requestJson } from "@/api/client";
import { checkoutResponseSchema, ordersResponseSchema } from "@/types/order";

type CheckoutInput = {
  shippingAddress: string;
  paymentMethod: string;
};

/* Fetch only the currently authenticated user's orders. */
export async function fetchOrders() {
  const response = await requestJson("/orders", ordersResponseSchema);
  return response.orders;
}

/* Create a real backend order using the current user's cart. */
export async function checkoutOrder(values: CheckoutInput) {
  const response = await requestJson(
    "/orders/checkout",
    checkoutResponseSchema,
    {
      method: "POST",
      body: JSON.stringify(values),
    },
  );

  return response.order;
}
