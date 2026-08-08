"use client";

import { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/helpers";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isAdding = useCartStore((state) => state.isLoading);
  const cart = useCartStore((state) => state.cart);

  const checkCartItem = (productId: number) => {
    return !!cart?.items?.some((item) => item.productId === productId);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addItem(product.id);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-64 w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          <p className="text-gray-600 text-sm">{product.brand}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-lg">
              {formatCurrency(product.price)}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                product.sex === "Male"
                  ? "bg-blue-100 text-blue-700"
                  : product.sex === "Female"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {product.sex || "Unisex"}
            </span>
          </div>
          {checkCartItem(product.id) ? (
            <span className="mt-4 font-semibold text-medium italic">
              In Cart
            </span>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAdding || checkCartItem(product.id)}
              className="w-full mt-3 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
