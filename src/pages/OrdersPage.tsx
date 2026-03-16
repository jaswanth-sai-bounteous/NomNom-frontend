import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { clearOrdersRequest, fetchOrders } from "@/api";
import SectionHeading from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getStoredUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { syncOrdersFromServer } from "@/lib/storeSync";
import { useOrderStore } from "@/store/orderStore";

const OrdersPage = () => {
  const queryClient = useQueryClient();
  const user = getStoredUser();
  const { orders } = useOrderStore();
  const { data: serverOrders, isLoading } = useQuery({
    queryKey: ["orders", user?.id ?? "guest"],
    queryFn: fetchOrders,
    enabled: Boolean(user?.id),
  });
  const clearOrdersMutation = useMutation({
    mutationFn: clearOrdersRequest,
    onSuccess: async () => {
      syncOrdersFromServer([]);
      await queryClient.invalidateQueries({ queryKey: ["orders", user?.id ?? "guest"] });
      toast.success("Orders cleared successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not clear orders");
    },
  });

  useEffect(() => {
    if (serverOrders) {
      syncOrdersFromServer(serverOrders);
    }
  }, [serverOrders]);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Orders"
          title="Your completed orders"
          description="Every checkout is stored in a simple Zustand store so you can view recent order history on this page."
        />
        {orders.length > 0 ? (
          <Button
            variant="outline"
            className="h-11 rounded-full border-stone-300"
            onClick={() => clearOrdersMutation.mutate()}
            disabled={clearOrdersMutation.isPending}
          >
            {clearOrdersMutation.isPending ? "Clearing..." : "Clear orders"}
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <Card className="rounded-[32px] border border-stone-200 bg-white p-10 text-center text-stone-600 shadow-[0_18px_40px_-30px_rgba(28,25,23,0.35)]">
          Loading your orders...
        </Card>
      ) : orders.length === 0 ? (
        <Card className="rounded-[32px] border border-stone-200 bg-white p-10 text-center text-stone-600 shadow-[0_18px_40px_-30px_rgba(28,25,23,0.35)]">
          You have not placed any orders yet.
        </Card>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-[0_18px_40px_-30px_rgba(28,25,23,0.35)]"
            >
              <CardHeader className="px-0 pb-5 pt-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-amber-700">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
                      {order.status}
                    </Badge>
                    <span className="text-lg font-semibold text-stone-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="mt-5 space-y-3 px-0 pb-0">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{item.product.title}</p>
                      <p className="text-stone-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-stone-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
