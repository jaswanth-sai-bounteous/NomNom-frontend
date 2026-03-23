import { api } from "@/api/client";
import { categoriesResponseSchema } from "@/types/category";

export async function fetchCategories() {
  const response = await api.get("/categories");
  return categoriesResponseSchema.parse(response.data).categories;
}
