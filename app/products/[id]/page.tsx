"use client";

import { Product } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/helpers";
import { PageLoader } from "@/components/ui/Loader";
import { fetchProductById } from "@/data/product";
import Breadcrumb from "@/components/ui/Breadcrumb";

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
          console.log("Product:", response);
          setProduct(response?.product);
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

  // Parse notes if it's a string
  const parseNotes = (notes: any) => {
    if (typeof notes === "string") {
      try {
        return JSON.parse(notes);
      } catch {
        return null;
      }
    }
    return notes;
  };

  const productNotes = parseNotes(product.notes);

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <Breadcrumb productName={product.name} productBrand={product.brand} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {product.name}
          </h1>
          <p className="text-xl text-gray-600 mb-2">{product.brand}</p>
          <p className="text-3xl font-bold text-blue-600 mb-4">
            {formatCurrency(product.price)}
          </p>

          {/* Description */}
          {product.desc && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">{product.desc}</p>
            </div>
          )}

          {/* Notes Section */}
          {productNotes && typeof productNotes === "object" && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Fragrance Notes
              </h3>
              <div className="space-y-3">
                {productNotes.top_notes &&
                  productNotes.top_notes.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Top Notes
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {productNotes.top_notes.map(
                          (note: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                            >
                              {note}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {productNotes.heart_notes &&
                  productNotes.heart_notes.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Heart Notes
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {productNotes.heart_notes.map(
                          (note: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                            >
                              {note}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {productNotes.base_notes &&
                  productNotes.base_notes.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Base Notes
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {productNotes.base_notes.map(
                          (note: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700"
                            >
                              {note}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Gender */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold text-gray-500">Gender:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
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

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold text-gray-500">
              Quantity:
            </span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-6 py-2 text-lg font-semibold min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full py-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium text-lg mt-auto"
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding to Cart...
              </span>
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
