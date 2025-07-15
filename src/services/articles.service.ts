import { Article } from '../model/articles.model';

export const getArticlesService = async (query: any) => {
  const page = parseInt(query.page) || 0;
  const size = parseInt(query.size) || 6;
  const { status, filter, search, sort } = query;

  let matchQuery: Record<string, any> = {};

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

export const getArticleCountService = async (query: any) => {
  const { filter, search } = query;

  const matchQuery: Record<string, any> = {
    title: { $regex: search || '', $options: 'i' },
  };

  if (filter) {
    matchQuery.publisher = filter;
  }

  const allArticles = await Article.countDocuments(matchQuery);
  const approvedArticles = await Article.countDocuments({
    status: 'approved',
    ...matchQuery,
  });

  return {
    allArticles,
    approvedArticles,
  };
};

export const getPremiumArticlesService = async () => {
  return await Article.find({ isPremium: 'yes' });
};

export const getRecentArticlesService = async () => {
  return await Article.find().sort({ view_count: -1 });
};
