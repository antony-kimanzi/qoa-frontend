"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { PageLoader } from "@/components/ui/Loader";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading) return <PageLoader />;

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Username</p>
            <p className="font-semibold">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-semibold">{user.role}</p>
          </div>
          <div className="pt-4 border-t flex gap-4">
            <Link
              href="/orders"
              className="flex-1 py-2 bg-black text-white text-center rounded-lg hover:bg-gray-800 transition-colors"
            >
              My Orders
            </Link>
            {user.role === "Admin" && (
              <Link
                href="/dashboard"
                className="flex-1 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
