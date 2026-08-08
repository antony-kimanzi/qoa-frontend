"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import Navbar from "./layout/Navbar";
import Footer from "@/components/layout/Footer";

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

  if (isFullScreenRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-50">
        <Navbar />
      </div>
      <main className="pt-16 min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
