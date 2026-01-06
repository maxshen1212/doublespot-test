import express, { Application, Request, Response } from "express";
import cors from "cors";

const app: Application = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "active", message: "Backend is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Backend is connected!",
    timestamp: new Date().toISOString(),
  });
});

export default app;
