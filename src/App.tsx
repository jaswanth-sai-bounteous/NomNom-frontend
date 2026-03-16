import { Suspense, lazy, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { fetchCart, fetchCurrentUser, fetchOrders } from "@/api";
import RouteFallback from "@/components/RouteFallback";
import { Toaster } from "@/components/ui/sonner";
import MainLayout from "@/components/layout/MainLayout";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  isAuthenticated,
  saveAuth,
} from "@/lib/auth";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { queryClient } from "@/lib/queryClient";
import {
  clearUserStores,
  syncCartFromServer,
  syncOrdersFromServer,
  syncUserStores,
} from "@/lib/storeSync";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";

const About = lazy(lazyWithRetry(() => import("@/components/About"), "about"));
const CartPage = lazy(lazyWithRetry(() => import("@/pages/CartPage"), "cart"));
const Home = lazy(lazyWithRetry(() => import("@/pages/Home"), "home"));
const Login = lazy(lazyWithRetry(() => import("@/pages/Login"), "login"));
const MenuPage = lazy(lazyWithRetry(() => import("@/pages/MenuPage"), "menu"));
const OrdersPage = lazy(lazyWithRetry(() => import("@/pages/OrdersPage"), "orders"));
const ProductDetailPage = lazy(
  lazyWithRetry(() => import("@/pages/ProductDetailPage"), "product-detail"),
);
const PaymentCancelPage = lazy(
  lazyWithRetry(() => import("@/pages/PaymentCancelPage"), "payment-cancel"),
);
const PaymentSuccessPage = lazy(
  lazyWithRetry(() => import("@/pages/PaymentSuccessPage"), "payment-success"),
);
const Signup = lazy(lazyWithRetry(() => import("@/pages/Signup"), "signup"));

const ProtectedRoute = () => {
  const token = getStoredToken();
  const storedUser = getStoredUser();
  const hasLoadedCartFromServer = useCartStore((state) => state.hasLoadedFromServer);
  const hasLoadedOrdersFromServer = useOrderStore((state) => state.hasLoadedFromServer);
  const { data, isFetching, isError } = useQuery({
    queryKey: ["current-user", token],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
  });
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart", storedUser?.id ?? token],
    queryFn: fetchCart,
    enabled: Boolean(token),
    retry: false,
  });
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["orders", storedUser?.id ?? token],
    queryFn: fetchOrders,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (token && data?.user) {
      saveAuth(token, data.user);
      syncUserStores(data.user);
    }
  }, [data, token]);

  useEffect(() => {
    if (cartData) {
      syncCartFromServer(cartData);
    }
  }, [cartData]);

  useEffect(() => {
    if (ordersData) {
      syncOrdersFromServer(ordersData);
    }
  }, [ordersData]);

  useEffect(() => {
    if (isError) {
      clearAuth();
      clearUserStores();
      void queryClient.removeQueries({
        predicate: (query) => {
          const firstKey = query.queryKey[0];
          return firstKey === "cart" || firstKey === "orders" || firstKey === "current-user";
        },
      });
    }
  }, [isError]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  /*
    If we already have a stored user from a valid previous session,
    render the page immediately and refresh auth in the background.
    This avoids delaying LCP on every protected route.
  */
  if (!storedUser && isFetching) {
    return <RouteFallback />;
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  if (!hasLoadedCartFromServer && isCartLoading) {
    return <RouteFallback />;
  }

  if (!hasLoadedOrdersFromServer && isOrdersLoading) {
    return <RouteFallback />;
  }

  return <Outlet />;
};

const GuestOnlyRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route element={<GuestOnlyRoute />}>
          <Route
            path="/login"
            element={
              <Suspense fallback={<RouteFallback variant="auth" />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/signup"
            element={
              <Suspense fallback={<RouteFallback variant="auth" />}>
                <Signup />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/success"
          element={
            <Suspense fallback={<RouteFallback />}>
              <PaymentSuccessPage />
            </Suspense>
          }
        />
        <Route
          path="/cancel"
          element={
            <Suspense fallback={<RouteFallback />}>
              <PaymentCancelPage />
            </Suspense>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/home"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="/about"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <About />
                </Suspense>
              }
            />
            <Route
              path="/menu"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <MenuPage />
                </Suspense>
              }
            />
            <Route
              path="/product/:id"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ProductDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/cart"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <CartPage />
                </Suspense>
              }
            />
            <Route
              path="/orders"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <OrdersPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={isAuthenticated() ? "/home" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
