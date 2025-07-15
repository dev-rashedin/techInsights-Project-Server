import express, { Application, Request, Response } from 'express';
import {
  globalErrorHandler,
  notFoundHandler,
  StatusCodes,
} from 'express-error-toolkit';

import cors from 'cors';

import userRouter from './routes/users.route';
import authRouter from './routes/auth.route';

const app: Application = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://tech-insights-d2159.web.app',
    'https://tech-insights-d2159.firebaseapp.com',
  ],
  // credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

// routes
app.use('/jwt', authRouter)
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
