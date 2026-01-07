import dotenv from "dotenv";
import app from "./app";
import pool from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 3000;

// 測試資料庫連接
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL 資料庫連接成功");
    connection.release();
  } catch (error) {
    console.error("MySQL 資料庫連接失敗:", error);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testDatabaseConnection();
});
