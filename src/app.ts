import express, { Application, Request, Response } from 'express';
import {
  globalErrorHandler,
  notFoundHandler,
  StatusCodes,
} from 'express-error-toolkit';

import cors from 'cors';

import usersRouter from './routes/users.route';
import authRouter from './routes/auth.route';
import articlesRouter from './routes/articles.route';
import publishersRouter from './routes/publishers.route';
import adminStatsRouter from './routes/adminStats.route';
import messagesRouter from './routes/messages.route';
import votedLanguageRouter from './routes/votedLanguage.route';

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
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

// routes
app.use('/jwt', authRouter);
app.use('/users', usersRouter);
app.use('/', articlesRouter);
app.use('/publishers', publishersRouter);
app.use('/admin-stats', adminStatsRouter);
app.use('/message', messagesRouter);
app.use('/lang-quiz', votedLanguageRouter);

// home route
app.get('/', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Welcome to The-Tech-Insight server',
  });
});

app.all('*', (req, res, next) => {
  console.log('🔍 Incoming headers:', req.headers);
  next();
});

// not found hanlder
app.use(notFoundHandler);

// global error handler
app.use(globalErrorHandler);

export default app;
