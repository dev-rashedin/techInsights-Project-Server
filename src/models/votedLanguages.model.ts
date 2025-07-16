import { Schema, model } from 'mongoose';

export interface IVotedLanguage {
  voterEmail: string;
  votedLang: string;
}

const votedLanguageSchema = new Schema<IVotedLanguage>(
  {
    voterEmail: { type: String, required: true },
    votedLang: { type: String, required: true },
  },
  {
    collection: 'voted-languages', 
  },
);

export const VotedLanguage = model<IVotedLanguage>(
  'VotedLanguage',
  votedLanguageSchema,
);
