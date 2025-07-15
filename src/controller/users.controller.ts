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

/**
 * app.put('/users', async (req, res) => {
   0;
   const user = req.body;

   const query = { email: user.email };
   const options = { upsert: true };

   // checking if the user exists already
   const existingUser = await userCollection.findOne(query);

   try {
     if (existingUser) {
       // if existing user try to change his role
       if (user.status === 'requested') {
         const result = await userCollection.updateOne(query, {
           $set: { status: 'requested' },
         });
         return res.send(result);
       }

       // making admin
       if (user.role === 'admin') {
         const result = await userCollection.updateOne(query, {
           $set: {
             role: 'admin',
             status: 'verified',
             subscription: 'premium',
           },
         });
         sendEmail(user?.email, {
           subject: 'Congratulation for Adminship',
           message:
             'You are now an admin of our TechInsights website. Please follow the community rules.',
         });
         return res.send(result);
       }

       // remove admin
       if (user.status === 'remove-admin') {
         const result = await userCollection.updateOne(query, {
           $set: {
             status: 'verified',
             role: 'user',
             subscription: 'usual',
           },
         });
         sendEmail(user?.email, {
           subject: 'Adminship cancelled',
           message:
             'You are now no longer an admin of our TechInsights website. Please reach out us to know more.',
         });
         return res.send(result);
       }

       // if existing user try to buy subscription
       if (user.subscription === 'premium') {
         const result = await userCollection.updateOne(query, {
           $set: {
             subscription: 'premium',
             premiumToken:
               Math.floor(new Date().getTime() / 1000) + user.validationTime,
           },
         });
         return res.send(result);
       }

       return res.send({
         message: 'User already exists',
         insertedId: null,
       });
     }

     // saving the user data for the first time

     const updateDoc = {
       $set: {
         ...user,
       },
     };
     const result = await userCollection.updateOne(query, updateDoc, options);

     // send email
     sendEmail(user?.email, {
       subject: 'Welcome to TechInsights',
       message: `Dear friend, your registration in TechInsights website is successful. Stay connected with us, hope you'll enjoy the journey.`,
     });

     res.send(result);
   } catch (error) {
     return res.send(error);
   }
 });
 */
