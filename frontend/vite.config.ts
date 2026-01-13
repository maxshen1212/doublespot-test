import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");
  // Use backend:3000 for Docker, localhost:3000 for local dev
  const apiUrl = env.VITE_API_URL || "http://backend:3000";
  console.log("API Target:", apiUrl);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // Needed for Docker
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
