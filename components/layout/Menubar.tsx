"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface MenubarProps {
  setOpen: (open: boolean) => void;
}

export default function Menubar({ setOpen }: MenubarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/signin");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden sticky absolute bottom-50 left-0 z-50 w-full bg-white border-b shadow-lg z-99">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col space-y-3">
          <Link
            href="/"
            className={`hover:text-gray-600 ${isActive("/") ? "text-gray-900 font-semibold bg-gray-100" : ""}`}
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/shop"
            className={`hover:text-gray-600 ${isActive("/products") ? "text-gray-900 font-semibold bg-gray-100" : ""}`}
            onClick={() => setOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/contact"
            className={`hover:text-gray-600 ${isActive("/about") ? "text-gray-900 font-semibold bg-gray-100" : ""}`}
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>

          <div className="border-t pt-3">
            {user ? (
              <>
                <div className="text-sm text-gray-600 mb-2">
                  Hello, {user.username}
                </div>
                <Link
                  href="/profile"
                  className={`block hover:text-gray-600 ${isActive("/profile") ? "text-gray-900 font-semibold" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                {user.role === "Admin" && (
                  <Link
                    href="/dashboard"
                    className="block text-blue-600 hover:text-blue-800"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="block hover:text-gray-600"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
