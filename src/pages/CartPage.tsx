import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { checkoutOrder } from "@/api";
import ImageWithFallback from "@/components/ImageWithFallback";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { getStoredUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";
import type { ServerOrder } from "@/types";

const useCheckoutCart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = getStoredUser();
  const resetCart = useCartStore((state) => state.resetCart);

  return useMutation({
    mutationFn: () =>
      checkoutOrder({
        shippingAddress: "NomNom default delivery address",
        paymentMethod: "COD",
      }),
    onSuccess: (order) => {
      const currentOrders =
        queryClient.getQueryData<ServerOrder[]>(["orders", user?.id ?? "guest"]) ?? [];
      queryClient.setQueryData(["orders", user?.id ?? "guest"], [order, ...currentOrders]);
      resetCart();
      void queryClient.invalidateQueries({
        queryKey: ["orders", user?.id ?? "guest"],
        refetchType: "active",
      });
      toast.success("Order placed successfully");
      navigate("/orders");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    },
  });
};

const CartPage = () => {
  const items = useCartStore((state) => state.items);
  const isLoading = useCartStore((state) => state.isLoading);
  const isSaving = useCartStore((state) => state.isSaving);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const clearAll = useCartStore((state) => state.clearAll);
  const checkoutMutation = useCheckoutCart();

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const deliveryFee = items.length > 0 ? 49 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    checkoutMutation.mutate();
  };
  return (
    <div className="space-y-10 pb-10">
      <SectionHeading
        eyebrow="Cart"
        title="Review your order before checkout"
        description="Adjust quantities, remove items, or place your order when everything looks right."
      />

      {isLoading ? (
        <div className="rounded-[32px] border border-stone-200 bg-white p-10 text-center shadow-[0_18px_40px_-30px_rgba(28,25,23,0.38)]">
          <ShoppingBag className="mx-auto size-12 animate-pulse text-stone-300" />
          <h2 className="mt-4 text-2xl font-semibold text-stone-900">
            Loading your cart
          </h2>
          <p className="mt-3 text-stone-600">
            We are checking your latest cart items from the server.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[32px] border border-stone-200 bg-white p-10 text-center shadow-[0_18px_40px_-30px_rgba(28,25,23,0.38)]">
          <ShoppingBag className="mx-auto size-12 text-stone-400" />
          <h2 className="mt-4 text-2xl font-semibold text-stone-900">
            Your cart is empty
          </h2>
          <p className="mt-3 text-stone-600">
            Add something delicious from the menu to get started.
          </p>
          <Button asChild className="mt-6 h-11 rounded-full bg-stone-900 px-6 hover:bg-amber-600">
            <Link to="/menu">Browse menu</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-[28px] border border-stone-200 bg-white p-4 shadow-[0_18px_40px_-30px_rgba(28,25,23,0.35)] sm:grid-cols-[140px_1fr]"
              >
                <ImageWithFallback
                  src={item.product.foodImg}
                  alt={item.product.title}
                  className="h-36 w-full rounded-[20px] object-cover"
                />

                <div className="flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-900">
                        {item.product.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {item.product.description || "Freshly prepared at NomNom."}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-stone-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex h-11 items-center rounded-full border border-stone-300 bg-stone-50">
                      <button
                        type="button"
                        aria-label={`Decrease quantity for ${item.product.title}`}
                        onClick={() => void updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-4 text-stone-700"
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center font-medium text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity for ${item.product.title}`}
                        onClick={() => void updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-4 text-stone-700"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => void removeProduct(item.product.id)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-600 transition hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_18px_40px_-30px_rgba(28,25,23,0.38)]">
            <h2 className="text-2xl font-semibold text-stone-900">Order summary</h2>
            {isSaving ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                <Loader2 className="size-4 animate-spin" />
                Updating cart...
              </div>
            ) : null}
            <div className="mt-6 space-y-4 text-sm text-stone-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-base font-semibold text-stone-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              className="mt-8 h-12 w-full rounded-full bg-stone-900 text-white hover:bg-amber-600"
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || isSaving}
            >
              Place order (COD)
            </Button>

            <Button
              variant="outline"
              className="mt-3 h-12 w-full rounded-full border-stone-300"
              onClick={() => void clearAll()}
              disabled={isSaving}
            >
              Clear cart
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;
