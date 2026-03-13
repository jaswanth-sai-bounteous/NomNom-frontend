import { z } from "zod";

import { optionalTextSchema, stringIdSchema } from "@/types/shared";

export const categorySchema = z.object({
  id: stringIdSchema,
  name: z.string(),
  description: optionalTextSchema.optional(),
});

export const categoriesResponseSchema = z.object({
  categories: z.array(categorySchema),
});

export type Category = z.infer<typeof categorySchema>;
