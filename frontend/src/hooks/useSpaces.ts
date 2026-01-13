import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSpaces,
  fetchSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
} from "../services";
import type { CreateSpaceInput, UpdateSpaceInput } from "../types";

const QUERY_KEY = "spaces";

/**
 * 取得所有 Spaces
 */
export function useSpaces() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: fetchSpaces,
  });
}

/**
 * 取得單一 Space
 */
export function useSpace(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchSpaceById(id),
    enabled: !!id,
  });
}

/**
 * 建立 Space mutation
 */
export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSpaceInput) => createSpace(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * 更新 Space mutation
 */
export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSpaceInput }) =>
      updateSpace(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * 刪除 Space mutation
 */
export function useDeleteSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSpace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
