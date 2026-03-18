import { useQuery } from "@tanstack/react-query";
import { ChefHat, Clock3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { fetchProductsPage } from "@/api";
import About from "@/components/About";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartActions } from "@/hooks/useCartActions";
import { getCartQuantityTotal, useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

const Home = () => {
  // Input: a product from the UI.
  // Output: triggers an optimistic add-to-cart flow.
  const { addProduct } = useCartActions();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = useCartStore((state) => getCartQuantityTotal(state.items));
  const { data: productsPage, isLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: () => fetchProductsPage({ page: 1, limit: 6 }),
  });

  const featuredProducts = productsPage?.products.slice(0, 3) ?? [];

  const handleAddToCart = (product: Product) => {
    void addProduct(product, 1);
  };

  return (
    <div className="space-y-16 pb-10">
      <HeroCarousel />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Sparkles,
            title: "Chef-crafted plates",
            description: "Every recipe is made to feel special without being complicated.",
          },
          {
            icon: Clock3,
            title: "Fast and fresh",
            description: "Reliable preparation times for lunch breaks, evenings, and weekends.",
          },
          {
            icon: ChefHat,
            title: "Comfort with style",
            description: "The menu keeps familiar favorites polished and beautifully presented.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_40px_-32px_rgba(28,25,23,0.38)]"
          >
            <item.icon className="size-9 rounded-2xl bg-amber-100 p-2 text-amber-700" />
            <h3 className="mt-5 text-xl font-semibold text-stone-900">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Popular Picks"
            title="A few dishes guests keep coming back for"
            description="Browse a small selection of customer favorites to get a feel for the menu."
          />
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-stone-300 px-6 text-stone-800 hover:bg-stone-100"
          >
            <Link to="/menu">See full menu</Link>
          </Button>
        </div>

        {cartCount > 0 ? (
          <p className="text-sm text-stone-500">
            Your current cart has {cartCount} item
            {cartCount > 1 ? "s" : ""}.
          </p>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="h-[360px] animate-pulse rounded-[28px] border border-stone-200 bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isInCart={cartItems.some((item) => item.product.id === product.id)}
              />
            ))}
          </div>
        )}
      </section>

      <About variant="section" />
    </div>
  );
};

export default Home;
