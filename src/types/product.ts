import { z } from "zod";

import { categorySchema } from "@/types/category";
import { optionalTextSchema, priceSchema, stringIdSchema } from "@/types/shared";

const rawProductSchema = z.object({
  id: stringIdSchema,
  title: z.string(),
  description: optionalTextSchema.optional(),
  price: priceSchema,
  categories: z.array(categorySchema).optional(),
  category: categorySchema.optional(),
  foodImg: optionalTextSchema.optional(),
  food_img: optionalTextSchema.optional(),
  image: optionalTextSchema.optional(),
});

export const productSchema = rawProductSchema.transform((product) => ({
  id: product.id,
  title: product.title,
  description: product.description,
  price: product.price,
  categories: product.categories ?? (product.category ? [product.category] : []),
  foodImg: product.foodImg ?? product.food_img ?? product.image ?? undefined,
}));

export const paginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(1),
  hasNextPage: z.boolean(),
});

export const productsPageSchema = z.object({
  products: z.array(productSchema),
  pagination: paginationSchema,
});

export const productResponseSchema = z.object({
  product: productSchema,
});

export const featuredProductsResponseSchema = z.object({
  featured: z.array(productSchema).default([]),
});

export type Product = z.infer<typeof productSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ProductsPage = z.infer<typeof productsPageSchema>;
