import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchProductsPage, type ProductFilters } from "@/api";

type UseInfiniteProductsInput = {
  search: string;
  categoryId: string;
  limit?: number;
};

export const useInfiniteProducts = ({
  search,
  categoryId,
  limit = 9,
}: UseInfiniteProductsInput) => {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", search, categoryId, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchProductsPage({
        page: pageParam,
        limit,
        search: search || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
      } satisfies ProductFilters),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
  });
};
