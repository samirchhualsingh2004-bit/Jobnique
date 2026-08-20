import axios from "axios";

// Clean and validate the base URL
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "https://jobnique.onrender.com/api/v1";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
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

    // Allow browser to auto-set boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicPaths = [
        "/",
        "/login",
        "/register",
        "/forgot-password",
        "/jobs",
      ];
      const isPublicPath = publicPaths.includes(window.location.pathname);

      localStorage.removeItem("token");

      if (!isPublicPath && !error.config?.url?.includes("/auth/me")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;