import { Document } from 'mongoose';

export type TagType =
  | 'AI'
  | 'cyberSecurity'
  | 'software'
  | 'Web Development'
  | 'Programming'
  | 'DevOps';

export interface IArticle extends Document {
  title: string;
  image_url: string;
  description: string;
  tags: TagType[];
  publisher: string;
  view_count: number;
  isPremium: 'yes' | 'no';
  status: 'approved' | 'pending' | 'rejected';
  posted_by: string;
  posted_time: string;
  writers_email: string;
}

