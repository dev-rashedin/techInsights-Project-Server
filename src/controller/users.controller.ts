import { Request, Response } from "express";
import * as userService from "../services/users.service";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
} from "express-error-toolkit";

// fetch all users
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  if (!users || users.length === 0) throw new NotFoundError("users not found");
  res.send(users);
});

export const getUserByEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const email = req.params.email;
    if (!email) throw new BadRequestError("email is required");
    const user = await userService.getUserByEmail(email);
    res.send(user);
  },
);

export const upsertUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const user = await userService.upsertUser(userData);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updateUserByEmail = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const updateData = req.body;
    const result = await userService.updateUserByEmail(email, updateData);
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};
