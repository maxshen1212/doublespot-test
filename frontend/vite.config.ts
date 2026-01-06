import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");
  console.log(env.VITE_API_URL);
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true, // Needed for Docker
      proxy: {
        "/api": {
          // If running in Docker, use 'http://backend:3000'
          // If running locally, use 'http://localhost:3000'
          target: env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
