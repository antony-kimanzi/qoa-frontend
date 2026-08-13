import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important: sends cookies with requests
});

// Helper: Check if endpoint is public (no auth required)
const isPublicEndpoint = (url: string = ""): boolean => {
  const publicEndpoints = ["/auth/login", "/auth/register", "/auth/refresh"];
  return publicEndpoints.some((endpoint) => url.includes(endpoint));
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept public endpoints
    if (isPublicEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Handle 401 errors - the guard will handle refresh automatically
    // Just reject and let the app handle it (e.g., redirect to login)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear any client-side state if needed
      // The server has already attempted refresh via the guard
      // If we get here, it means the guard couldn't refresh the token

      // Redirect to login page
      if (typeof window !== "undefined") {
        // Optionally clear any client-side storage
        window.location.href = "/";
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
