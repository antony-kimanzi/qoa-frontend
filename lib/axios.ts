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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

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

    // Only handle 401 errors
    if (error.response?.status !== 401 || error.response?.status !== 403) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loop
    if (originalRequest._retry) {
      // Refresh failed - redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Attempt to refresh the token
      // The refresh token is automatically sent via cookies (withCredentials: true)
      // Even though we can't see it in JavaScript, the browser sends it automatically
      const response = await api.post("/auth/refresh");

      // Process queued requests
      processQueue();

      // Retry the original request with new cookies
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed - reject all queued requests
      processQueue(refreshError);

      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
