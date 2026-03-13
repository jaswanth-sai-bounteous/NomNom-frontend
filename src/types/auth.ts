import { z } from "zod";

import { userSchema } from "@/types/user";

export const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
  message: z.string().optional(),
});

export const signupResponseSchema = z.object({
  message: z.string().optional(),
  token: z.string().optional(),
  user: userSchema.optional(),
});

export const refreshResponseSchema = z.object({
  message: z.string().optional(),
  token: z.string(),
});

export type LoginForm = z.infer<typeof loginFormSchema>;
export type SignupForm = z.infer<typeof signupFormSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
