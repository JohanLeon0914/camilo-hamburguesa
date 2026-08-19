import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";

export const metadata: Metadata = {
  title: "Camilo Hamburguesas",
  description: "Menú digital y pedidos de Camilo Hamburguesas.",
  openGraph: {
    title: "Camilo Hamburguesas",
    description: "Hamburguesas americanas modernas, pedidos rápidos y recompensas.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
