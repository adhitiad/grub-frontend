// Root Layout for Grub Frontend
import { Navigation } from "@/components/layout/Navigation";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/lib/auth";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grub Distributor",
  description: "Modern food distribution management system",
  keywords: ["food", "distribution", "management", "orders", "inventory"],
  authors: [{ name: "Grub Team" }],

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: 1280,
  height: 720,
  themeColor: "#2563eb",
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <div id="root" className="h-full">
                <Navigation />
                {children}
              </div>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
