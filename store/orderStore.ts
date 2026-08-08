import { create } from "zustand";
import axios from "axios";
import {
  Order,
  OrderData,
  OrderItem,
  Payment,
  PaymentOrder,
} from "@/lib/types";
import { createOrder, getOrderById, getOrders } from "@/data/order";
import { initiatePayment, queryPaymentStatus } from "@/data/payment";

interface OrderStore {
  orders: Order[] | [];
  order: Order | null;
  items: OrderItem[];
  isLoading: boolean;
  error: string | null;
  createOrder: (
    data: OrderData,
  ) => Promise<{ success: boolean; orderId?: number; message?: string }>;
  initiatePayment: (data: PaymentOrder) => Promise<{
    success: boolean;
    checkoutRequestID?: string;
    message?: string;
  }>;
  checkPaymentStatus: (checkoutRequestId: string) => Promise<{
    success: boolean;
    status?: string;
    isPaid?: boolean;
    paymentResult?: Payment;
    message?: string;
  }>;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  order: null,
  items: [],
  isLoading: false,
  error: null,

  createOrder: async (data: OrderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createOrder(data);
      set({ isLoading: false });
      return { success: true, orderId: response?.data?.order?.id };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Failed to create order")
        : error instanceof Error
          ? error.message
          : "Failed to create order";

      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getOrders();
      const orders = response?.data?.orders;
      set({ orders: orders, isLoading: false });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Failed to fetch user orders")
        : error instanceof Error
          ? error.message
          : "Failed to fetch user orders";

      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchOrderById: async (orderId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getOrderById(orderId);
      const order = response?.data?.order;
      set({ order: order, items: order?.items || [], isLoading: false });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Failed to fetch order")
        : error instanceof Error
          ? error.message
          : "Failed to fetch order";

      set({ error: message, isLoading: false });
      throw error;
    }
  },

  initiatePayment: async (data: PaymentOrder) => {
    set({ isLoading: true, error: null });
    try {
      const response = await initiatePayment(data);
      set({ isLoading: false });
      return {
        success: true,
        checkoutRequestID: response?.data?.checkoutRequestID,
      };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Payment failed")
        : error instanceof Error
          ? error.message
          : "Payment failed";

      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  checkPaymentStatus: async (checkoutRequestId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await queryPaymentStatus(checkoutRequestId);
      set({ isLoading: false });
      return {
        success: true,
        status: response?.data?.status,
        isPaid: response?.data?.isPaid,
        paymentResult: response?.data?.transaction,
      };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Payment status check failed")
        : error instanceof Error
          ? error.message
          : "Payment check failed";

      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
}));
