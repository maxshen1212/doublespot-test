import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "database",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "my_app_db",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

const requiredEnvs = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
requiredEnvs.forEach(env => {
  if (!process.env[env]) {
    console.warn(`${env} not set, using default`);
  }
});

export { prisma };
