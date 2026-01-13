import * as repo from "../repos/space.repo.js";
import { SpaceDTO } from "../types.js";
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

export async function getSpaceUsecase(id: string): Promise<SpaceDTO> {
  if (!id) throw new Error("id is required");

  const space = await repo.getSpaceById(id);
  if (!space) throw new Error("space not found");

  return toDTO(space);
}
