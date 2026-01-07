import app from "./app";
import { prisma } from "./config/prisma";


const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});