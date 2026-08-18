import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Note the slash / instead of dot .

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});