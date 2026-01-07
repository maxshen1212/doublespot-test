import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService";

export async function getUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function postUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, name } = req.body;
    const user = await userService.createUser({ email, name });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

