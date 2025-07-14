import express from "express";
import { getAllUsers } from "../controller/users.controller";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
