import * as repo from "../repos/space.repo.js";

export async function deleteSpaceUsecase(id: string): Promise<void> {
  if (!id) throw new Error("id is required");
  await repo.deleteSpace(id);
}
