import { Router } from "express";
import {
  createSpace,
  deleteSpace,
  getSpace,
  listSpaces,
  updateSpace,
} from "./controller.js";

export const spaceRouter = Router();

spaceRouter.post("/", createSpace);
spaceRouter.get("/", listSpaces);
spaceRouter.get("/:id", getSpace);
spaceRouter.patch("/:id", updateSpace);
spaceRouter.delete("/:id", deleteSpace);
