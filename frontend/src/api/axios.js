import axios from "axios";

// Clean any accidental brackets, quotes, or whitespace
const rawEnv = import.meta.env.VITE_API_URL;
let BASE_URL = "https://jobnique.onrender.com/api/v1";

if (rawEnv && typeof rawEnv === "string") {
  const cleaned = rawEnv.replace(/[\[\]"']/g, "").trim().replace(/\/+$/, "");
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    BASE_URL = cleaned;
  }
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicPaths = ["/", "/login", "/register", "/forgot-password", "/jobs"];
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