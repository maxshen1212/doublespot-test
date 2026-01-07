import { describe, it, expect, vi, beforeEach } from "vitest";
import { userService } from "../userService";
import { prisma } from "../../config/prisma";

// Mock Prisma
vi.mock("../../config/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [{ id: 1, email: "test@example.com", name: "Test" }];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

      const users = await userService.listUsers();

      expect(users).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const newUser = { email: "new@example.com", name: "New User" };
      const createdUser = { id: 1, ...newUser };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(createdUser);

      const result = await userService.createUser(newUser);

      expect(result).toEqual(createdUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: newUser });
    });

    it("should throw error if email exists", async () => {
      const existingUser = { id: 1, email: "test@example.com", name: "Test" };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

      await expect(
        userService.createUser({ email: "test@example.com", name: "Test" })
      ).rejects.toThrow("Email already exists");
    });
  });
});
