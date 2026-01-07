import { prisma } from "../config/prisma";
import { Prisma } from "../generated/prisma/client";

async function listUsers() {
  return prisma.user.findMany();
}

async function createUser(data: Prisma.UserCreateInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  return prisma.user.create({
    data,
  });
}

export const userService = {
  listUsers,
  createUser,
};
