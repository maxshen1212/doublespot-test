import express, {
  Application,
  NextFunction,
  Request,
  Response,
} from "express";
import cors from "cors";
import { prisma } from "./config/prisma";
import userRouter from "./routes/user";

const app: Application = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "active", message: "Backend is running" });
});

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, message: "Prisma is connected to MySQL" });
  } catch (err) {
    console.error("Prisma health check failed", err);
    res.status(500).json({ ok: false, message: "Prisma connection failed" });
  }
});

app.use("/api/users", userRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

export default app;
