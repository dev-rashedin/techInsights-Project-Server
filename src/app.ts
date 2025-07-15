import express, { Application, Request, Response } from 'express';
import {
  globalErrorHandler,
  notFoundHandler,
  StatusCodes,
} from 'express-error-toolkit';
import userRouter from './routes/users.route';

const app: Application = express();
const cors = require('cors');

app.use(express.json());

app.use(cors());

app.use('/users', userRouter);

// home route
app.get('/', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Welcome to The-Tech-Insight server',
  });
});

// not found hanlder
app.use(notFoundHandler);

// global error handler
app.use(globalErrorHandler);

export default app;
