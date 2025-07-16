import { FilterQuery } from 'mongoose';
import { ArticleQueryParams } from '../interface';
import { IArticle } from '../interface/articles.interface';
import { Article } from '../model/articles.model';

export const getArticlesService = async (query: ArticleQueryParams) => {
  const page = parseInt(query.page || '0');
  const size = parseInt(query.size || '6');
  const { status, filter, search, sort } = query;

const matchQuery: FilterQuery<IArticle> = {};

  if (search) {
    matchQuery.title = { $regex: search, $options: 'i' };
  }

  if (status) {
    matchQuery.status = status;
  }

  if (filter) {
    matchQuery.publisher = filter;
  }

  const result = await Article.aggregate([
    { $match: matchQuery },
    {
      $addFields: {
        posted_time_as_date: {
          $dateFromString: {
            dateString: '$posted_time',
            format: '%m/%d/%Y',
            onError: 'Invalid Date',
            onNull: 'No Date',
          },
        },
      },
    },
    { $sort: { posted_time_as_date: sort === 'asc' ? 1 : -1 } },
    { $skip: page * size },
    { $limit: size },
  ]);

  return { result };
};


export const getPremiumArticlesService = async () => {
  return await Article.find({ isPremium: 'yes' });
};

export const getRecentArticlesService = async () => {
  const articles = await Article.aggregate([
    {
      $addFields: {
        posted_time_as_date: {
        $dateFromString: {
            dateString: '$posted_time',
            format: '%m/%d/%Y',
            onError: null,
          onNull: null,
        }
      }
      }
    },
    { $sort: { posted_time_as_date: -1 } }, 
    { $limit: 6 },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
    }},
  ]);

  return articles;
};

export const getRecentArticlesServiceBanner = async () => {
  const articles = await Article.aggregate([
    {
      $addFields: {
        posted_time_as_date: {
        $dateFromString: {
            dateString: '$posted_time',
            format: '%m/%d/%Y',
            onError: null,
          onNull: null,
        }
      }
      }
    },
    { $sort: { posted_time_as_date: -1 } }, 
    { $limit: 6 },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        image_url: 1,
        tags: 1,
        posted_time: 1,
        publisher: 1,
    }},
  ]);

  return articles;
};