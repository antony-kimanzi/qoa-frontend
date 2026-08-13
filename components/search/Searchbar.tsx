"use client";

import { useState, useEffect } from "react";
import { useSearchStore } from "@/store/searchStore";
import { searchProductByQuery } from "@/data/product";

export default function Searchbar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setResults, setIsOpen, setQuery: setSearchQuery } = useSearchStore();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const searchTerm = query.trim();

      if (searchTerm) {
        setIsLoading(true);
        try {
          console.log("Searching for:", searchTerm);
          const response = await searchProductByQuery(searchTerm);

          console.log("Search response: Response:", response);
          console.log("Search response: Response data:", response.data);

          // Normalize response to handle AxiosResponse or direct object
          const respData = (response as any)?.data ?? (response as any);
          const products = respData?.products || respData?.data?.products || [];
          setResults(products);
          setSearchQuery(searchTerm);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error details:", error);
          if (error instanceof Error && "response" in error) {
            const err = error as any;
            console.error("Response data:", err.response.data);
            console.error("Response status:", err.response.status);
            console.error("Response headers:", err.response.headers);
          }
          setResults([]);
          setIsOpen(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setSearchQuery("");
        setIsOpen(false);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, setResults, setIsOpen, setSearchQuery]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search perfumes..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        disabled={isLoading}
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            setResults([]);
            setSearchQuery("");
            setIsOpen(false);
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
      {isLoading && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        </div>
      )}
    </div>
  );
}
