import { z } from "zod"

// Zod schema for a Product (Food Item)
export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  foodImg: z.string().optional(),
  price: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Array schema for featured / product lists
export const productsSchema = z.array(productSchema)

// Infer TS type
export type Product = z.infer<typeof productSchema>