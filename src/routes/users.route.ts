import express from "express";
import { getAllUsers } from "../controller/users.controller";
import { getUserByEmail } from "../services/users.service";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);

userRouter.get("/:email", getUserByEmail);

export default userRouter;
