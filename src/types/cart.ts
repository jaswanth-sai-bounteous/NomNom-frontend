import { z } from "zod";

import { productSchema } from "@/types/product";

export const cartItemSchema = z.object({
  id: z.string(),
  product: productSchema,
  quantity: z.number().int().min(1),
});

export const serverCartItemSchema = z.object({
  id: z.string(),
  product: productSchema.nullable(),
  quantity: z.number().int().min(1),
  totalPrice: z.number(),
});

export const cartSchema = z.object({
  cart: z
    .object({
      id: z.string(),
      userId: z.string(),
    })
    .nullable(),
  items: z.array(serverCartItemSchema),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type ServerCart = z.infer<typeof cartSchema>;
