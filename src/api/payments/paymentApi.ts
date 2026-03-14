import { z } from "zod";

import { requestJson } from "@/api/client";

const createCheckoutSessionResponseSchema = z.object({
  url: z.string().url(),
});

type StripeCheckoutItem = {
  name: string;
  price: number;
  quantity: number;
};

type CreateStripeCheckoutSessionInput = {
  items: StripeCheckoutItem[];
};

export async function createStripeCheckoutSession(
  values: CreateStripeCheckoutSessionInput,
) {
  return requestJson(
    "/payments/create-checkout-session",
    createCheckoutSessionResponseSchema,
    {
      method: "POST",
      body: JSON.stringify(values),
    },
  );
}
