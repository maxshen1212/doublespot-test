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

export async function listSpacesUsecase(): Promise<SpaceDTO[]> {
  const spaces = await repo.listSpaces();
  return spaces.map(toDTO);
}
