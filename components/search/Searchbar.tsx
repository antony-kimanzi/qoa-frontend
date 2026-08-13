"use client";

import { useState, useEffect } from "react";
import { useSearchStore } from "@/store/searchStore";
import { api } from "@/lib/axios";

export default function Searchbar() {
  const [query, setQuery] = useState("");
  const { setResults, setIsOpen, setQuery: setSearchQuery } = useSearchStore();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const searchTerm = query.trim();

      if (searchTerm) {
        try {
          const response = await api.get(
            `/product/search?q=${encodeURIComponent(searchTerm)}`,
          );
          // Handle the response based on your API structure
          const products =
            response.data?.data?.products || response.data?.products || [];
          setResults(products);
          setSearchQuery(searchTerm);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
          setIsOpen(false);
        }
      } else {
        setResults([]);
        setSearchQuery("");
        setIsOpen(false);
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
    </div>
  );
}
