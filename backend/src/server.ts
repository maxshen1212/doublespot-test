import dotenv from "dotenv";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// 檢查資料庫連線
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // 測試查詢
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database query test passed");

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// 啟動伺服器
async function startServer() {
  const isConnected = await connectDatabase();

  if (!isConnected) {
    console.error("Failed to connect to database. Exiting...");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
});
