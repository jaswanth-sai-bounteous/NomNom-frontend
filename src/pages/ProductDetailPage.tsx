import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Minus, Plus, ShoppingBag } from "lucide-react";

import { fetchProductById, fetchProductsPage } from "@/api";
import ImageWithFallback from "@/components/ImageWithFallback";
import PageSkeleton from "@/components/PageSkeleton";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/useCartActions";
import { useCartStore } from "@/store/cartStore";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

const ProductDetailPage = () => {
  const { id = "" } = useParams();
  const [quantity, setQuantity] = useState(1);
  // Input: product + amount.
  // Output: sends an optimistic add-to-cart request and syncs with the backend.
  const { addProduct } = useCartActions();
  const cartItems = useCartStore((state) => state.items);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  });

  const { data: productsPage } = useQuery({
    queryKey: ["product-suggestions"],
    queryFn: () => fetchProductsPage({ page: 1, limit: 40 }),
  });

  const suggestions = useMemo(() => {
    const otherProducts =
      productsPage?.products.filter((item) => item.id !== id) ?? [];

    const startIndex =
      otherProducts.length === 0
        ? 0
        : id.split("").reduce((total, character) => total + character.charCodeAt(0), 0) %
          otherProducts.length;

    return Array.from({ length: Math.min(3, otherProducts.length) }, (_, index) => {
      return otherProducts[(startIndex + index) % otherProducts.length];
    });
  }, [id, productsPage?.products]);

  const handleAddToCart = (selectedProduct: Product, amount = quantity) => {
    void addProduct(selectedProduct, amount);
  };

  const isInCart = cartItems.some((item) => item.product.id === product?.id);

  if (isLoading) {
    return <PageSkeleton blocks={1} cards={3} />;
  }

  if (isError || !product) {
    return (
      <Alert variant="destructive" className="rounded-[32px] border-red-200 bg-red-50 p-8">
        <ChefHat className="size-4" />
        <AlertTitle>We could not load this dish</AlertTitle>
        <AlertDescription>
          Please make sure the backend is running and that the product exists.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-14 pb-10">
      <Card className="grid gap-8 rounded-[32px] border border-stone-200 bg-white py-0 shadow-[0_24px_50px_-35px_rgba(28,25,23,0.45)] lg:grid-cols-[1fr_0.95fr]">
        <div className="overflow-hidden rounded-[28px] bg-stone-100 p-6">
          <ImageWithFallback
            src={product.foodImg}
            alt={product.title}
            fallbackLabel={product.title}
            className="h-full min-h-[320px] w-full rounded-[24px] object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <CardHeader className="space-y-4 px-6 pt-6 lg:px-8 lg:pt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
              Dish Details
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
              {product.title}
            </h1>
            <p className="text-base leading-8 text-stone-600">
              {product.description || "Freshly prepared and plated with care."}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              {product.categories.map((category) => (
                <Badge
                  key={category.id}
                  className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
                >
                  {category.name}
                </Badge>
              ))}
            </div>

            <Separator />

            <div className="text-3xl font-semibold text-stone-900">
              {formatCurrency(product.price)}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-none bg-transparent px-6 pb-6 pt-0 lg:px-8 lg:pb-8 sm:flex-row sm:items-center">
            <div className="flex h-12 items-center rounded-full border border-stone-300 bg-stone-50">
              <button
                type="button"
                aria-label={`Decrease quantity for ${product.title}`}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="px-4 text-stone-700 transition hover:text-stone-900"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-10 text-center font-medium text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity for ${product.title}`}
                onClick={() => setQuantity((value) => value + 1)}
                className="px-4 text-stone-700 transition hover:text-stone-900"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {isInCart ? (
              <Button
                asChild
                className="h-12 rounded-full bg-emerald-700 px-6 text-white hover:bg-emerald-800"
              >
                <Link to="/cart">
                  <ShoppingBag className="mr-2 size-4" />
                  View cart
                </Link>
              </Button>
            ) : (
              <Button
                className="h-12 rounded-full bg-stone-900 px-6 text-white hover:bg-amber-600"
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingBag className="mr-2 size-4" />
                Add to cart
              </Button>
            )}
          </CardFooter>
        </div>
      </Card>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="You May Also Like"
          title="More dishes worth trying"
          description="A few more menu picks chosen in a predictable way so the page stays stable and easy to understand."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((suggestedProduct) => (
            <ProductCard
              key={suggestedProduct.id}
              product={suggestedProduct}
              onAddToCart={(item) => handleAddToCart(item, 1)}
              isInCart={cartItems.some((item) => item.product.id === suggestedProduct.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
