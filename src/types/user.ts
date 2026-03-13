import { z } from "zod";

import { stringIdSchema } from "@/types/shared";

export const userSchema = z.object({
  id: stringIdSchema,
  name: z.string(),
  email: z.string().email(),
});

export const currentUserResponseSchema = z.object({
  user: userSchema,
});

export type User = z.infer<typeof userSchema>;
