import * as repo from "../repos/space.repo.js";
import { SpaceDTO, UpdateSpaceInput } from "../types.js";
import type { Space } from "../../../generated/prisma/client.js";

function toDTO(space: Space): SpaceDTO {
  return {
    id: space.id,
    name: space.name,
    capacity: space.capacity,
    createdAt: space.createdAt.toISOString(),
    updatedAt: space.updatedAt.toISOString(),
  };
}

export async function updateSpaceUsecase(
  id: string,
  input: UpdateSpaceInput,
): Promise<SpaceDTO> {
  if (!id) throw new Error("id is required");

  // minimal validation
  const data: { name?: string; capacity?: number } = {};
  if (typeof input.name === "string") {
    if (!input.name.trim()) throw new Error("name cannot be empty");
    data.name = input.name.trim();
  }
  if (typeof input.capacity !== "undefined") {
    if (!Number.isInteger(input.capacity) || input.capacity <= 0)
      throw new Error("capacity must be a positive integer");
    data.capacity = input.capacity;
  }
  if (Object.keys(data).length === 0) throw new Error("no fields to update");

  // (optional) you could check existence first; prisma.update will throw if not found
  const updated = await repo.updateSpace(id, data);
  return toDTO(updated);
}
