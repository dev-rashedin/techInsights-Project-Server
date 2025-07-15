import express from 'express';
import { generateJwtToken } from '../controller/auth.controller';

const authRouter = express.Router();

authRouter.post('/', generateJwtToken);

export default authRouter;
