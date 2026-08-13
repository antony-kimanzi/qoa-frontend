"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  productName?: string;
  productBrand?: string;
}

export default function Breadcrumb({
  productName,
  productBrand,
}: BreadcrumbProps) {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);

  // If we're on a product detail page
  if (productName && paths.includes("products")) {
    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 py-4 px-4 bg-gray-50 rounded-lg mb-6">
        <Link
          href="/"
          className="hover:text-black transition-colors flex items-center"
        >
          <Home className="w-4 h-4 mr-1" />
          Home
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Link href="/products" className="hover:text-black transition-colors">
          Products
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {productBrand && `${productBrand} `}
          {productName}
        </span>
      </nav>
    );
  }

  // For other pages
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 py-4">
      <Link
        href="/"
        className="hover:text-black transition-colors flex items-center"
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </Link>
      {paths.map((path, index) => {
        const href = "/" + paths.slice(0, index + 1).join("/");
        const isLast = index === paths.length - 1;
        const label = path.charAt(0).toUpperCase() + path.slice(1);

        return (
          <div key={href} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-black transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
