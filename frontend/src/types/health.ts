/**
 * 健康檢查回應（對齊 backend GET /）
 */
export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}
