import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,      // dados frescos por 2 minutos
      gcTime: 1000 * 60 * 10,         // cache em memória por 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
