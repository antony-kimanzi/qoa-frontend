import { create } from "zustand";
import { AxiosError } from "axios";
import { Cart, CartItem } from "@/lib/types";
import { api } from "@/lib/axios";
import {
  addToCart,
  deleteCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/data/cart";

interface CartStore {
  cart: Cart | null;
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await getCart();
      const cart = response?.data?.cart;
      set({
        cart: cart,
        items: cart?.items || [],
        isLoading: false,
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status !== 401) {
        set({ error: "Failed to fetch cart", isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  addItem: async (productId: number, quantity: number = 1) => {
    set({ isLoading: true });
    try {
      await addToCart(productId, quantity);
      await get().fetchCart();
      set({ isLoading: false });
    } catch (error: unknown) {
      set({ error: "Failed to add item", isLoading: false });
      throw error;
    }
  },

  updateItem: async (itemId: number, quantity: number) => {
    set({ isLoading: true });
    try {
      await updateCartItem(itemId, quantity);
      await get().fetchCart();
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to update item", isLoading: false });
      throw error;
    }
  },

  removeItem: async (itemId: number) => {
    set({ isLoading: true });
    try {
      await removeCartItem(itemId);
      await get().fetchCart();
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to remove item", isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await deleteCart();
      await get().fetchCart();
      set({ isLoading: false, cart: null, items: [], error: null });
    } catch (error) {
      set({ error: "Failed to remove cart", isLoading: false });
      throw error;
    }
  },
}));
