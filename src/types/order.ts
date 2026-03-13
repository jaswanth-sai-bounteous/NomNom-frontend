import { z } from "zod";

import { cartItemSchema } from "@/types/cart";
import { productSchema } from "@/types/product";

export const orderSchema = z.object({
  id: z.string(),
  items: z.array(cartItemSchema),
  totalAmount: z.number(),
  status: z.enum(["confirmed", "preparing", "delivered"]),
  createdAt: z.string(),
});

export const serverOrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  foodItemId: z.string(),
  quantity: z.number().int().min(1),
  price: z.number(),
  totalPrice: z.number(),
  product: productSchema,
});

export const serverOrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  paymentMethod: z.string().nullable().optional(),
  shippingAddress: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
  status: z.enum(["confirmed", "preparing", "delivered"]),
  totalAmount: z.number(),
  items: z.array(serverOrderItemSchema),
});

export const ordersResponseSchema = z.object({
  orders: z.array(serverOrderSchema),
});

export const checkoutResponseSchema = z.object({
  message: z.string(),
  order: serverOrderSchema,
});

export type Order = z.infer<typeof orderSchema>;
export type ServerOrder = z.infer<typeof serverOrderSchema>;
