import express from 'express';
import { addOrEditUser, getAllUsers } from '../controller/users.controller';
import { getUserByEmail } from '../controller/users.controller';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);

userRouter.get('/:email', getUserByEmail);

userRouter.put('/', addOrEditUser);

export default userRouter;
