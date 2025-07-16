import { Request, Response } from 'express';
import {
  getArticlesByEmailService,
  getArticlesService,
  getPremiumArticlesService,
  getRecentArticlesService,
  getRecentArticlesServiceBanner,
  getSingleArticleService,
  postArticleService,
} from '../services/articles.service';
import { asyncHandler, BadRequestError, StatusCodes } from 'express-error-toolkit';

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

// Get single article by ID
export const getSingleArticle = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) throw new BadRequestError('Article ID is required');

  const result = await getSingleArticleService(id);
  res.send(result);
});

// Get articles by email
export const getArticlesByEmail = asyncHandler(async (req: Request, res: Response) => {
  const email = req.params.email;

  if (!email) throw new BadRequestError('Email is required');

  const result = await getArticlesByEmailService(email);
  res.send(result);
});

// Post a new article
export const postArticle = asyncHandler(async (req: Request, res: Response) => {
  const articleData = req.body;

  if (!articleData) throw new BadRequestError('Article data is required');

  const result = await postArticleService(articleData);
  res.send(result);
});

