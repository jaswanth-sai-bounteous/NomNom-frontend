import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChefHat } from "lucide-react";

import { fetchCategories } from "@/api";
import InfiniteLoader from "@/components/menu/InfiniteLoader";
import MenuFilters from "@/components/menu/MenuFilters";
import PageSkeleton from "@/components/PageSkeleton";
import ProductCard from "@/components/ProductCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useCartActions } from "@/hooks/useCartActions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { getCartQuantityTotal, useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");

  // Input: fast-typing search text from the user.
  // Output: slower debounced text so we do not refetch on every keystroke.
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const deferredSearch = useDeferredValue(debouncedSearch);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = useCartStore((state) => getCartQuantityTotal(state.items));
  const { addProduct } = useCartActions();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({
    search: deferredSearch.trim(),
    categoryId: activeCategory,
  });

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data],
  );
  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

  const loadMoreRef = useIntersectionObserver({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onIntersect: () => {
      void fetchNextPage();
    },
  });

  const handleAddToCart = (product: Product) => {
    void addProduct(product, 1);
  };

  return (
    <div className="space-y-10 pb-10">
      <MenuFilters
        categories={categories}
        searchQuery={searchInput}
        activeCategory={activeCategory}
        onSearchChange={setSearchInput}
        onCategoryChange={setActiveCategory}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="rounded-full px-4 py-1 text-sm">
          {totalItems} dishes found
        </Badge>
        <Badge variant="outline" className="rounded-full px-4 py-1 text-sm">
          Cart items: {cartCount}
        </Badge>
        {deferredSearch ? (
          <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
            Searching for "{deferredSearch}"
          </Badge>
        ) : null}
      </div>

      {isError ? (
        <Alert variant="destructive" className="rounded-[28px] border-red-200 bg-red-50 p-6">
          <ChefHat className="size-4" />
          <AlertTitle>We could not load the menu</AlertTitle>
          <AlertDescription>
            Please make sure the backend API is available and the frontend is using the correct
            `VITE_API_URL`.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <PageSkeleton blocks={1} cards={6} />
      ) : products.length === 0 ? (
        <Alert className="rounded-[28px] border-stone-200 bg-white p-6">
          <ChefHat className="size-4" />
          <AlertTitle>No dishes matched your filters</AlertTitle>
          <AlertDescription>
            Try a different search term or switch to another category.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isInCart={cartItems.some((item) => item.product.id === product.id)}
              />
            ))}
          </div>

          <InfiniteLoader isVisible={isFetchingNextPage} />
          <div ref={loadMoreRef} className="h-4" />
        </>
      )}
    </div>
  );
};

export default MenuPage;
