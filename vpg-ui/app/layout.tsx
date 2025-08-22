import "./globals.css";
import type { Metadata } from "next";
import { ReactQueryProvider } from "@/lib/queryClient";
import { ToastProvider } from "@/components/toast-provider";

export const metadata: Metadata = {
  title: "VPG",
  description: "Virtual Persona Generator (MVP)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ReactQueryProvider>
          <ToastProvider>
            <main>{children}</main>
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
