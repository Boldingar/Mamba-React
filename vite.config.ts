import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: API_BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
