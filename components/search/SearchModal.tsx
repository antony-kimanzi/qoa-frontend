"use client";

import { useSearchStore } from "@/store/searchStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "@/utils/helpers";
import { Product } from "@/lib/types";

export default function SearchModal() {
  const router = useRouter();
  const { isOpen, results, query, setIsOpen } = useSearchStore();

  if (!isOpen) return null;

  const handleResultClick = (id: number) => {
    setIsOpen(false);
    router.push(`/products/${id}`);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="container mx-auto px-4 mt-20 max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-xl max-h-[70vh] overflow-y-auto animate-slide-up">
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <h3 className="font-semibold">
              {query ? <>Results for &quot;{query}&quot;</> : "Search Results"}
            </h3>
          </div>
          <div className="p-4">
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((product: Product) => (
                  <div
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={product.imageUrl || "/placeholder-image.png"}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      {product.sex && (
                        <span className="text-xs text-gray-400">
                          {product.sex}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-gray-500">
                <p>No products found for &quot;{query}&quot;</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Type something to search...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
