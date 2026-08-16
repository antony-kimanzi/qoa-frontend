import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from "@/data/auth";
import { RegisterData, User } from "@/lib/types";
import { create } from "zustand";
import { fetchProfile } from "@/data/user";

interface ApiError {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const err = error as ApiError;
    return err.response?.data?.message || err.message || fallback;
  }

  return fallback;
};

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  fetchAccount: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await loginApi({ email, password });
      console.log("Response:", response);
      console.log("Response status:", response?.status);
      console.log("Response data:", response?.data);

      if (response?.data?.user) {
        set({
          user: response?.data?.user,
          isLoading: false,
          error: null,
        });
        return { success: true, user: response?.data?.user };
      } else {
        throw new Error("No user data received");
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        "Error occurred while signing in",
      );
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await registerApi(data);
      console.log("Response:", response);
      console.log("Response status:", response?.status);
      console.log("Response data:", response?.data);

      if (response?.data?.user) {
        set({
          user: response.data.user,
          isLoading: false,
          error: null,
        });
        return { success: true, user: response.data.user };
      } else {
        throw new Error("No user data received");
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        "Error occurred while signing up",
      );
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchAccount: async () => {
    try {
      const response = await fetchProfile();

      if (response && response.id) {
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          role: response.role,
        };
        set({ user });
      } else {
        set({ user: null });
      }
    } catch (error: unknown) {
      const err =
        typeof error === "object" && error !== null
          ? (error as ApiError)
          : undefined;

      if (err?.response?.status !== 401) {
        set({ error: "Error fetching user" });
      }
      set({ user: null });
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ user: null, error: null, isLoading: false });
      window.location.href = "/signin";
    }
  },
}));
