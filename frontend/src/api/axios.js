import axios from "axios";

// Fallback URL matching Express server (Port 4000 & /api/v1)
const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Enables cookie-based session handling
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Authorization Bearer token & handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Allow browser to auto-set boundary for FormData (e.g., resume uploads)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global API errors (e.g., Session Expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // List of public pages where token cleanup shouldn't interrupt flow
      const publicPaths = ["/", "/login", "/register", "/forgot-password", "/jobs"];
      const isPublicPath = publicPaths.includes(window.location.pathname);

      // Clean up local storage if token expired
      localStorage.removeItem("token");

      // Optional: Auto-redirect only if user was trying to perform a protected action
      if (!isPublicPath && !error.config?.url?.includes("/auth/me")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;