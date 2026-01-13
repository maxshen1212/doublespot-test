import express, { Application, Request, Response } from "express";
import cors from "cors";
import { spaceRouter } from "./features/space/routes.js";

const app: Application = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Health Check Route (for frontend proxy)
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "active",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/spaces", spaceRouter);

export default app;
