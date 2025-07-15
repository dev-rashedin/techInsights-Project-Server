import express from 'express';
import { getArticleCount, getArticles, getPremiumArticles, getRecentArticles } from '../controller/articles.controller';

const articlesRouter = express.Router();


articlesRouter.get('/articles', getArticles)
articlesRouter.get('/premium-articles', getPremiumArticles);
articlesRouter.get('/recent-articles', getRecentArticles);
articlesRouter.get('/article-count', getArticleCount);

export default articlesRouter;