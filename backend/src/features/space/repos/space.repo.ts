import { prisma } from "../../../config/prisma.js";

export async function createSpace(data: { name: string; capacity: number }) {
  return prisma.space.create({ data });
}

export async function getSpaceById(id: string) {
  return prisma.space.findUnique({ where: { id } });
}

export async function listSpaces() {
  return prisma.space.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateSpace(
  id: string,
  data: { name?: string; capacity?: number },
) {
  return prisma.space.update({ where: { id }, data });
}

export async function deleteSpace(id: string) {
  return prisma.space.delete({ where: { id } });
}
