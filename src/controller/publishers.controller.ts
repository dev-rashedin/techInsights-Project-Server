// src/modules/publishers/publishers.controller.ts

import { Request, Response } from 'express';
import {asyncHandler, BadRequestError} from 'express-error-toolkit';
import {
  getAllPublishersService,
  createPublisherService,
} from '../services/publishers.service';

// GET all publishers
export const getAllPublishers = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await getAllPublishersService();
    res.send(result);
  },
);

// POST create new publisher
export const createPublisher = asyncHandler(
  async (req: Request, res: Response) => {
    const publisherData = req.body;

    if (!publisherData || !publisherData.name) {
      throw new BadRequestError('Publisher data and name are required');
    }

    const result = await createPublisherService(publisherData);
    res.send(result);
  },
);
