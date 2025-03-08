import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/RouteGuard";
import { SpeedInsights } from "@vercel/speed-insights/next";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouteGuard>
          <Component {...pageProps} />
          <SpeedInsights />
        </RouteGuard>
      </QueryClientProvider>
    </AuthProvider>
  );
}
