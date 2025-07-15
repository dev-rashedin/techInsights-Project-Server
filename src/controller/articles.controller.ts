import { Request, Response } from 'express';
import {
  getArticlesService,
  getArticleCountService,
  getPremiumArticlesService,
  getRecentArticlesService,
} from '../services/articles.service';
import { asyncHandler, BadRequestError } from 'express-error-toolkit';

export const getArticles = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;
  if (!query) throw new BadRequestError('Query parameters are required');

  const { result } = await getArticlesService(query);
  res.status(200).send(result);
});

export const getArticleCount = asyncHandler(async (req: Request, res: Response) => {
  const counts = await getArticleCountService(req.query);
  res.status(200).send(counts);
});

export const getPremiumArticles = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getPremiumArticlesService();
  res.status(200).send(result);
});


export const getRecentArticles = asyncHandler(async (_req: Request, res: Response) => {

    const result = await getRecentArticlesService();
    res.status(200).send(result);
 
})
