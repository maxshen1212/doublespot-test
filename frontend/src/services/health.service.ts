import { api } from "./api";
import type { HealthResponse } from "../types";

/**
 * 健康檢查 API
 * 對應 backend GET /
 * 注意：健康檢查在根路徑，需要去掉 /api 前綴
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/health");
  return data;
}
