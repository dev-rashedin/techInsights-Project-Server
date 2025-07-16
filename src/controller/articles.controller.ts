import { Request, Response } from 'express';
import {
  getArticlesService,
  getPremiumArticlesService,
  getRecentArticlesService,
  getRecentArticlesServiceBanner,
} from '../services/articles.service';
import { asyncHandler, BadRequestError, StatusCodes } from 'express-error-toolkit';
import { } from './../services/articles.service';

export const getArticles = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query;
  if (!query) throw new BadRequestError('Query parameters are required');

  const { result } = await getArticlesService(query);
  res.status(200).send(result);
});


export const getPremiumArticles = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getPremiumArticlesService();
  res.status(200).send(result);
});


export const getRecentArticles = asyncHandler(async (_req: Request, res: Response) => {

    const result = await getRecentArticlesService();
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Recent articles fetched successfully',
    data: result,
    })
 
})

export const getRecentArticlesBanner = asyncHandler(async (_req: Request, res: Response) => {

    const result = await getRecentArticlesServiceBanner();
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Recent articles for banner fetched successfully',
    data: result,
  });
 
})
