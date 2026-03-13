import { QueryClient } from "@tanstack/react-query";

/*
  This shared QueryClient lets the whole app use one cache.
  Keeping it in one file makes it easier to clear user-specific server data
  during login, logout, or account switching.
*/
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
