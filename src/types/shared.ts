import { z } from "zod";

export const stringIdSchema = z.union([z.string(), z.number()]).transform(String);

export const optionalTextSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value ?? undefined);

export const priceSchema = z.union([z.number(), z.string()]).transform((value) => {
  const price = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(price) ? 0 : price;
});
