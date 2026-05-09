import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";
import { CartProvider } from "./pages/CartContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
function App() {
  return <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </CartProvider>
    </QueryClientProvider>;
}
export {
  App as default
};
