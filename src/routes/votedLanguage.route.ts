import { Router } from 'express';
import {
  getLangStats,
  getUserVote,
  submitLangVote,
} from '../controllers/votedLanguages.controller';

const votedLanguageRouter = Router();

votedLanguageRouter.get('/', getLangStats);
votedLanguageRouter.get('/:email', getUserVote);
votedLanguageRouter.post('/', submitLangVote);

export default votedLanguageRouter;
