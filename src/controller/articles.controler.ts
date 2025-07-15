import { Request, Response } from 'express';
import {
  getArticlesService,
  getArticleCountService,
  getPremiumArticlesService,
  getRecentArticlesService,
} from '../services/articles.service';

export const getArticles = async (req: Request, res: Response) => {
  try {
    const { result } = await getArticlesService(req.query);
    res.status(200).send(result);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res
      .status(500)
      .send(error instanceof Error ? error.message : 'Server error');
  }
};

export const getArticleCount = async (req: Request, res: Response) => {
  try {
    const counts = await getArticleCountService(req.query);
    res.status(200).send(counts);
  } catch (error) {
    res
      .status(500)
      .send({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getPremiumArticles = async (_req: Request, res: Response) => {
  try {
    const result = await getPremiumArticlesService();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error Fetching Data' });
  }
};

export const getRecentArticles = async (_req: Request, res: Response) => {
  try {
    const result = await getRecentArticlesService();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error Fetching Data' });
  }
};
