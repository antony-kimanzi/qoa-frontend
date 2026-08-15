"use client";
import { CartItem, Product } from "@/lib/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/helpers";
import { fetchProducts } from "@/data/product";

const FeaturedCollections = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cart = useCartStore((state) => state.cart);
  const isAdding = useCartStore((state) => state.isLoading);
  const addItem = useCartStore((state) => state.addItem);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const handleAddItem = async (
    e: React.MouseEvent<HTMLButtonElement>,
    productId: number,
  ) => {
    e.preventDefault();
    setProductId(productId);
    try {
      await addItem(productId);
    } catch (error) {
      console.error(error);
    } finally {
      setProductId(null);
    }
  };

  const checkCartItem = (productId: number) => {
    return !!cart?.items?.some(
      (item: CartItem) => item.productId === productId,
    );
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        await fetchCart();
        const response = await fetchProducts();
        setProducts(response?.products || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-16 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h3 className="text-2xl font-semibold text-center mb-8">
        Featured Collection
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
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
                  {product.sex === "Male"
                    ? "[M]"
                    : product.sex === "Female"
                      ? "[F]"
                      : "[U]"}
                </span>
              </div>
              {checkCartItem(product.id) ? (
                <span className="mt-4 font-semibold text-medium italic">
                  In Cart
                </span>
              ) : (
                <button
                  onClick={(e) => handleAddItem(e, product.id)}
                  disabled={isAdding || checkCartItem(product.id)}
                  className="w-full mt-3 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
                >
                  {isAdding && productId === product.id
                    ? "Adding..."
                    : "Add to Cart"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCollections;
