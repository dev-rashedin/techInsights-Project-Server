// src/modules/publishers/publishers.service.ts

import { IPublisher, Publisher } from '../model/publishers.model';

export const getAllPublishersService = async () => {
  return await Publisher.find();
};

export const createPublisherService = async (publisherData: IPublisher) => {
  return await Publisher.create(publisherData);
};
