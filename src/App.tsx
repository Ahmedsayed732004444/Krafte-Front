import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import AppRouter from "./app/AppRouter";
import { NotificationProvider } from "@/features/notifications/context/NotificationContext";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <NotificationProvider>
          <AppRouter />
          <Toaster
            position="top-center"
            toastOptions={{
              style: { background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" },
            }}
          />
        </NotificationProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
