import { Request, Response } from 'express';
import * as userService from '../services/users.service';
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
  StatusCodes,
} from 'express-error-toolkit';

// fetch all users
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.fetchAllUsers();
  if (!users || users.length === 0) throw new NotFoundError('users not found');
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'users fetched successfully',
    count: users.length,
    data: users,
  });
});

export const getUserByEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const email = req.params.email;
    if (!email) throw new BadRequestError('email is required');
    const user = await userService.fetchUserByEmail(email);
    res.status(StatusCodes.OK).json({
      success: true,
      message: `user with email ${email} fetched successfully`,
      data: user,
    });
  },
);

export const addOrEditUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.body;

    if (!user || !user.email) {
      throw new BadRequestError('user data and email are required');
    }

     const result = await userService.createOrUpdateUser(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'user created or updated successfully',
      data: result,
    });
  },
);