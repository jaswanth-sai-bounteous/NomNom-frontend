import { api } from "@/api/client";
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
  const response = await api.get("/products", {
    params: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 9,
      search: filters.search,
      categoryId: filters.categoryId,
    },
  });

  return productsPageSchema.parse(response.data);
}

export async function fetchProductById(id: string) {
  const response = await api.get(`/products/${id}`);
  return productResponseSchema.parse(response.data).product;
}

export async function fetchFeaturedProducts() {
  const response = await api.get("/featured");
  return featuredProductsResponseSchema.parse(response.data).featured;
}
