import express from 'express';
import { getArticles, getArticlesByEmail, getPremiumArticles, getRecentArticles, getRecentArticlesBanner, getSingleArticle, postArticle } from '../controller/articles.controller';
import verifyToken from '../middlewares/verifyToken';

const articlesRouter = express.Router();


articlesRouter.get('/articles', getArticles)
articlesRouter.get('/premium-articles', getPremiumArticles);
articlesRouter.get('/recent-articles', getRecentArticles);
articlesRouter.get('/recent-articles-banner', getRecentArticlesBanner);
articlesRouter.get('/articles/:id', getSingleArticle);
articlesRouter.get('/my-articles/:email', verifyToken, getArticlesByEmail);
articlesRouter.post('/articles', verifyToken, postArticle);

export default articlesRouter;