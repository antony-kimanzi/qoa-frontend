import { create } from "zustand";
import { Product } from "@/lib/types";

interface SearchState {
  query: string;
  results: Product[];
  isOpen: boolean;
  setQuery: (query: string) => void;
  setResults: (results: Product[]) => void;
  setIsOpen: (isOpen: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isOpen: false,
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setIsOpen: (isOpen) => set({ isOpen }),
  clearSearch: () => set({ query: "", results: [], isOpen: false }),
}));
