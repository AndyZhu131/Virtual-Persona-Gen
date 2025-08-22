import "./globals.css";
import type { Metadata } from "next";
import { ReactQueryProvider } from "@/lib/queryClient";
import { ToastProvider } from "@/components/toast-provider";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "VPG",
  description: "Virtual Persona Generator (MVP)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <ReactQueryProvider>
            <ToastProvider>
              <main>{children}</main>
            </ToastProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
