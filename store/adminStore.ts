import { create } from "zustand";
import { api } from "@/lib/axios";
import { Order, Payment, NewProduct, Product, User } from "@/lib/types";

interface AdminStats {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalProducts: number;
  completedPayments: number;
  pendingPayments: number;
  conversionRate: number;
}

interface AdminStore {
  // State
  stats: AdminStats;
  orders: Order[];
  payments: Payment[];
  products: Product[];
  users: User[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  addProduct: (data: NewProduct) => Promise<void>;
  updateOrder: (id: number, data: Partial<Order>) => Promise<void>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  stats: {
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    completedPayments: 0,
    pendingPayments: 0,
    conversionRate: 0,
  },
  orders: [],
  payments: [],
  products: [],
  users: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all required data in parallel
      const [ordersRes, paymentsRes, productsRes, usersRes] = await Promise.all(
        [
          api.get("/order"),
          api.get("/payment"),
          api.get("/product"),
          api.get("/user"),
        ],
      );

      // Extract data from responses with fallbacks
      const orders = ordersRes?.data?.orders || [];
      const payments = paymentsRes?.data?.transactions || [];
      const products = productsRes?.data?.products || [];
      const users = usersRes?.data?.users || [];

      const ordersArray = Array.isArray(orders) ? orders : [];
      const paymentsArray = Array.isArray(payments) ? payments : [];
      const productsArray = Array.isArray(products) ? products : [];
      const usersArray = Array.isArray(users) ? users : [];

      // Calculate date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Filter orders for today and this week
      const todayOrders = ordersArray.filter((order: Order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today;
      });

      const weekOrders = ordersArray.filter((order: Order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= weekAgo;
      });

      // ✅ FIXED: Calculate revenues with proper status checking
      // Include both 'completed' and 'delivered' statuses as completed orders
      const completedStatuses = ["completed", "delivered", "paid"];

      const totalRevenue = ordersArray
        .filter((o: Order) => completedStatuses.includes(o.status))
        .reduce(
          (sum: number, order: Order) => sum + (order.totalAmount || 0),
          0,
        );

      const todayRevenue = todayOrders
        .filter((o: Order) => completedStatuses.includes(o.status))
        .reduce(
          (sum: number, order: Order) => sum + (order.totalAmount || 0),
          0,
        );

      const weekRevenue = weekOrders
        .filter((o: Order) => completedStatuses.includes(o.status))
        .reduce(
          (sum: number, order: Order) => sum + (order.totalAmount || 0),
          0,
        );

      // ✅ FIXED: Calculate payment stats correctly
      // Define payment statuses
      const completedPaymentStatuses = ["completed", "paid", "successful"];
      const pendingPaymentStatuses = [
        "pending",
        "pending_payment",
        "processing",
      ];

      const completedPayments = paymentsArray.filter((p: Payment) =>
        completedPaymentStatuses.includes(p.status),
      ).length;

      const pendingPayments = paymentsArray.filter((p: Payment) =>
        pendingPaymentStatuses.includes(p.status),
      ).length;

      // Calculate conversion rate (orders vs users)
      const conversionRate =
        usersArray.length > 0
          ? Math.round((ordersArray.length / usersArray.length) * 100)
          : 0;

      // Build stats object
      const stats: AdminStats = {
        totalRevenue,
        todayRevenue,
        weekRevenue,
        totalOrders: ordersArray.length,
        todayOrders: todayOrders.length,
        pendingOrders: ordersArray.filter(
          (o: Order) => o.status === "pending" || o.status === "processing",
        ).length,
        totalUsers: usersArray.length,
        totalProducts: productsArray.length,
        completedPayments,
        pendingPayments,
        conversionRate,
      };

      // Update store with all data and stats
      set({
        stats,
        orders: ordersArray,
        payments: paymentsArray,
        products: productsArray,
        users: usersArray,
        isLoading: false,
      });

      console.log("Stats calculated successfully:", stats);
      console.log("Orders:", orders.length);
      console.log("Payments:", payments.length);
      console.log("Users:", users.length);
      console.log("Products:", products.length);
    } catch (error) {
      console.error("❌ Failed to fetch stats:", error);
      set({
        error: "Failed to fetch stats. Please try again.",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/order");
      console.log("📦 Orders Response:", response);
      const orders = response?.data?.orders || [];
      set({ orders, isLoading: false });
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error);
      set({ error: "Failed to fetch orders", isLoading: false });
      throw error;
    }
  },

  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/payment");
      console.log("💳 Payments Response:", response);
      const payments = response?.data?.transactions || [];
      set({ payments, isLoading: false });
    } catch (error) {
      console.error("❌ Failed to fetch payments:", error);
      set({ error: "Failed to fetch payments", isLoading: false });
      throw error;
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/product");
      console.log("🛍️ Products Response:", response);
      const products = response?.data?.products || [];
      set({ products, isLoading: false });
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      set({ error: "Failed to fetch products", isLoading: false });
      throw error;
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/user");
      console.log("👤 Users Response:", response);
      const users = response?.data?.users || [];
      set({ users, isLoading: false });
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      set({ error: "Failed to fetch users", isLoading: false });
      throw error;
    }
  },

  addProduct: async (data: NewProduct) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/product", data);
      await get().fetchProducts();
      // Update stats after adding product
      await get().fetchStats();
      set({ isLoading: false });
    } catch (error) {
      console.error("❌ Failed to add product:", error);
      set({ error: "Failed to add product", isLoading: false });
      throw error;
    }
  },

  updateOrder: async (id: number, data: Partial<Order>) => {
    set({ error: null });
    try {
      const response = await api.patch(`/order/${id}`, data);
      const orders = get().orders.map((order) =>
        order.id === id ? { ...order, ...response.data } : order,
      );
      set({ orders });
      // Update stats after order update
      await get().fetchStats();
    } catch (error) {
      console.error("❌ Failed to update order:", error);
      set({ error: "Failed to update order" });
      throw error;
    }
  },

  updateProduct: async (id: number, data: Partial<Product>) => {
    set({ error: null });
    try {
      const response = await api.patch(`/product/${id}`, data);
      const products = get().products.map((product) =>
        product.id === id ? { ...product, ...response.data } : product,
      );
      set({ products });
      // Update stats after product update
      await get().fetchStats();
    } catch (error) {
      console.error("❌ Failed to update product:", error);
      set({ error: "Failed to update product" });
      throw error;
    }
  },

  updatePayment: async (id: string, data: Partial<Payment>) => {
    set({ error: null });
    try {
      const response = await api.patch(`/payment/${id}`, data);
      const payments = get().payments.map((payment) =>
        payment.id === id ? { ...payment, ...response.data } : payment,
      );
      set({ payments });
      // Update stats after payment update
      await get().fetchStats();
    } catch (error) {
      console.error("❌ Failed to update payment:", error);
      set({ error: "Failed to update payment" });
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    set({ error: null });
    try {
      await api.delete(`/product/${id}`);
      const products = get().products.filter((product) => product.id !== id);
      set({ products });
      // Update stats after product deletion
      await get().fetchStats();
    } catch (error) {
      console.error("❌ Failed to delete product:", error);
      set({ error: "Failed to delete product" });
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    set({ error: null });
    try {
      await api.delete(`/admin/users/${id}`);
      const users = get().users.filter((user) => user.id !== id);
      set({ users });
      // Update stats after user deletion
      await get().fetchStats();
    } catch (error) {
      console.error("❌ Failed to delete user:", error);
      set({ error: "Failed to delete user" });
      throw error;
    }
  },
}));
