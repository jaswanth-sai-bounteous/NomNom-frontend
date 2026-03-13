import { z } from "zod"

// Add product to featured
export const addFeaturedSchema = z.object({
  foodId: z.string().uuid(),
})