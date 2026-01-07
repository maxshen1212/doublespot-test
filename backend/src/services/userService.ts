import { prisma } from "../config/prisma";

type CreateUserInput = {
  email: string;
  name?: string;
};

async function listUsers() {
  return prisma.user.findMany();
}

async function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data,
  });
}

export const userService = {
  listUsers,
  createUser,
};
