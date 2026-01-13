import { api } from "./api";
import type { Space, CreateSpaceInput, UpdateSpaceInput } from "../types";

const ENDPOINT = "/spaces";

/**
 * 取得所有 Space
 * 對應 backend GET /api/spaces
 */
export async function fetchSpaces(): Promise<Space[]> {
  const { data } = await api.get<Space[]>(ENDPOINT);
  return data;
}

/**
 * 取得單一 Space
 * 對應 backend GET /api/spaces/:id
 */
export async function fetchSpaceById(id: string): Promise<Space> {
  const { data } = await api.get<Space>(`${ENDPOINT}/${id}`);
  return data;
}

/**
 * 建立 Space
 * 對應 backend POST /api/spaces
 */
export async function createSpace(input: CreateSpaceInput): Promise<Space> {
  const { data } = await api.post<Space>(ENDPOINT, input);
  return data;
}

/**
 * 更新 Space
 * 對應 backend PATCH /api/spaces/:id
 */
export async function updateSpace(
  id: string,
  input: UpdateSpaceInput
): Promise<Space> {
  const { data } = await api.patch<Space>(`${ENDPOINT}/${id}`, input);
  return data;
}

/**
 * 刪除 Space
 * 對應 backend DELETE /api/spaces/:id
 */
export async function deleteSpace(id: string): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
