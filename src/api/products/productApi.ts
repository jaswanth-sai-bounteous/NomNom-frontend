import { buildQueryString, requestJson } from "@/api/client";
import {
  featuredProductsResponseSchema,
  productResponseSchema,
  productsPageSchema,
  type ProductsPage,
} from "@/types/product";

export type ProductFilters = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
};

export async function fetchProductsPage(
  filters: ProductFilters = {},
): Promise<ProductsPage> {
  const queryString = buildQueryString({
    page: filters.page ?? 1,
    limit: filters.limit ?? 9,
    search: filters.search,
    categoryId: filters.categoryId,
  });

  return requestJson(`/products${queryString}`, productsPageSchema);
}

export async function fetchProductById(id: string) {
  const response = await requestJson(`/products/${id}`, productResponseSchema);
  return response.product;
}

export async function fetchFeaturedProducts() {
  const response = await requestJson("/featured", featuredProductsResponseSchema);
  return response.featured;
}
