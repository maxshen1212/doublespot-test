import axios from "axios";

/**
 * Axios 實例，統一管理 API 請求
 * Vite proxy 會將 /api 轉發到 backend
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});
