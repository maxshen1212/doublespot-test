import { Request, Response } from "express";
import { createSpaceUsecase } from "./usecases/create-space.usecase.js";
import { getSpaceUsecase } from "./usecases/get-space.usecase.js";
import { listSpacesUsecase } from "./usecases/list-spaces.usecase.js";
import { updateSpaceUsecase } from "./usecases/update-space.usecase.js";
import { deleteSpaceUsecase } from "./usecases/delete-space.usecase.js";

function handleError(res: Response, err: unknown) {
  const msg = err instanceof Error ? err.message : "unknown error";

  // Log error for debugging
  console.error("❌ Space API Error:", err);

  // very minimal mapping; can later formalize error classes
  if (msg.includes("not found")) return res.status(404).json({ error: msg });
  if (
    msg.includes("required") ||
    msg.includes("must") ||
    msg.includes("cannot") ||
    msg.includes("no fields")
  ) {
    return res.status(400).json({ error: msg });
  }
  return res.status(500).json({ error: msg });
}

export async function createSpace(req: Request, res: Response) {
  try {
    const result = await createSpaceUsecase({
      name: req.body?.name,
      capacity: Number(req.body?.capacity),
    });
    return res.status(201).json(result);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function getSpace(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "invalid id" });
    }

    const result = await getSpaceUsecase(id);
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function listSpaces(_req: Request, res: Response) {
  try {
    const result = await listSpacesUsecase();
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function updateSpace(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "invalid id" });
    }
    const result = await updateSpaceUsecase(id, {
      name: req.body?.name,
      capacity:
        typeof req.body?.capacity === "undefined"
          ? undefined
          : Number(req.body.capacity),
    });
    return res.status(200).json(result);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function deleteSpace(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "invalid id" });
    }
    await deleteSpaceUsecase(id);

    return res.status(204).send();
  } catch (err) {
    return handleError(res, err);
  }
}
