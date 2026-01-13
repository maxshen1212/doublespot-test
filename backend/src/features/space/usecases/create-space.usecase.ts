import * as repo from "../repos/space.repo.js";
import { CreateSpaceInput, SpaceDTO } from "../types.js";
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

export async function createSpaceUsecase(
  input: CreateSpaceInput,
): Promise<SpaceDTO> {
  // minimal business validation
  if (!input.name?.trim()) throw new Error("name is required");
  if (!Number.isInteger(input.capacity) || input.capacity <= 0)
    throw new Error("capacity must be a positive integer");

  const space = await repo.createSpace({
    name: input.name.trim(),
    capacity: input.capacity,
  });
  return toDTO(space);
}
