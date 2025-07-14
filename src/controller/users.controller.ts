import { Request, Response } from "express";
import * as userService from "../services/users.service";

// fetch all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await userService.getUserByEmail(email);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

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
