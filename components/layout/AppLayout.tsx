"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import Footer from "./Footer";
import { PageLoader } from "@/components/ui/Loader";
import Navbar from "./Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fetchUser = useAuthStore((state) => state.fetchAccount);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchUser(), fetchCart()]);
      setIsLoading(false);
    };
    init();
  }, [fetchUser, fetchCart]);

  const fullScreenRoutes = ["/signin", "/signup", "/login", "/register"];
  const isFullScreenRoute = fullScreenRoutes.includes(pathname || "");
  const noFooterRoutes = ["/checkout", "/cart"];
  const isNoFooterRoute = noFooterRoutes.includes(pathname || "");

  if (isFullScreenRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  // If it's a no-footer route (checkout/cart), just show navbar and content
  if (isNoFooterRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Default: Show navbar, content, and footer
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
