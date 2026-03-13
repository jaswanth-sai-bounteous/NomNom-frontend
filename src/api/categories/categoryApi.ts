import { requestJson } from "@/api/client";
import { categoriesResponseSchema } from "@/types/category";

export async function fetchCategories() {
  const response = await requestJson("/categories", categoriesResponseSchema);
  return response.categories;
}
