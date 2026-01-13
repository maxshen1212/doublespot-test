import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "../services";

/**
 * 健康檢查 hook
 */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: 1,
  });
}
