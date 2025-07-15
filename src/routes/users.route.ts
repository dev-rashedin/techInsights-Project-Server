import express from 'express';
import { addOrEditUser, getAllUsers } from '../controller/users.controller';
import { getUserByEmail } from '../controller/users.controller';
import verifyToken from '../middlewares/verifyToken';

const userRouter = express.Router();

userRouter.get('/', verifyToken, getAllUsers);

userRouter.get('/:email', getUserByEmail);

userRouter.put('/', addOrEditUser);

export default userRouter;
