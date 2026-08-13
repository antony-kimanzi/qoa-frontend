"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";
import { PageLoader } from "@/components/ui/Loader";
import { fetchProducts } from "@/data/product";
import { useCartStore } from "@/store/cartStore";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
