"use client";

import { Product } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/helpers";
import { PageLoader } from "@/components/ui/Loader";
import { fetchProductById } from "@/data/product";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const isAdding = useCartStore((state) => state.isLoading);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
        if (idStr) {
          const response = await fetchProductById(parseInt(idStr, 10));
          setProduct(response.data?.data?.product);
          setError(null);
        } else {
          setError("Product id is invalid or missing");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (product) {
      await addItem(product.id, quantity);
    }
  };

  if (loading) return <PageLoader />;

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-500">{error || "Product not found"}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-[400px] md:h-[500px]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl text-gray-600 mb-2">{product.brand}</p>
          <p className="text-2xl font-bold text-blue-600 mb-4">
            {formatCurrency(product.price)}
          </p>
          {product.desc && <p className="text-gray-700 mb-4">{product.desc}</p>}
          {product.notes && (
            <p className="text-gray-600 text-sm mb-4">
              {typeof product.notes === "string"
                ? product.notes
                : Array.isArray(product.notes)
                  ? product.notes.join(", ")
                  : JSON.stringify(product.notes)}
            </p>
          )}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold">Gender:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              -
            </button>
            <span className="text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
