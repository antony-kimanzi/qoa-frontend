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
  const navbarRoutes = ["/checkout", "/cart"];
  const isNavbarRoute = navbarRoutes.includes(pathname || "");

  if (isFullScreenRoute) {
    return <>{children}</>;
  }

  if (isNavbarRoute) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen font-body">{children}</main>
      </>
    );
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
