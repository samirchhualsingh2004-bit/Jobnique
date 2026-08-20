import axios from "axios";

// Clean and sanitize the base URL to prevent bracket/slash formatting bugs
const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === "string") {
    return envUrl
      .replace(/[\[\]]/g, "")     // Remove accidental brackets [ ]
      .trim()
      .replace(/\/+$/, "");       // Strip trailing slashes
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

// Request Interceptor: Attach Bearer Token & handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser set the boundary for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global API errors (e.g. 401 Session Expiration)
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