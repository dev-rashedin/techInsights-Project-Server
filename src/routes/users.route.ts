import express from 'express';
import { addOrEditUser, getAllUsers, updateUserProfile } from '../controller/users.controller';
import { getUserByEmail } from '../controller/users.controller';
import verifyToken from '../middlewares/verifyToken';
import verifyAdmin from '../middlewares/verifyAdmin';

const userRouter = express.Router();

userRouter.get('/', verifyToken, verifyAdmin, getAllUsers);

userRouter.get('/:email', getUserByEmail);

userRouter.put('/', addOrEditUser);

userRouter.patch('/:email', verifyToken, updateUserProfile);

export default userRouter;
