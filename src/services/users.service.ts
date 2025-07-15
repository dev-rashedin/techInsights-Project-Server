import { NotFoundError } from 'express-error-toolkit';
import { User, } from '../model/users.model';
import sendEmail from '../utils/sendEmail';
import { IUser, IUserWithValidation } from '../interface/users.interface';

// fetch all users from database
export const fetchAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

export const fetchUserByEmail = async (
  email: string,
): Promise<IUser | null> => {
  const result = await User.findOne({ email });
  if (!result) throw new NotFoundError('user not found');
  return result;
};

export const createOrUpdateUser = async (user: IUserWithValidation) => {
  const query = { email: user.email };
  const options = { upsert: true };

  const existingUser = await User.findOne(query);

  if (existingUser) {
    // 1. User status: "requested"
    if (user.status === 'requested') {
      return await User.updateOne(query, { $set: { status: 'requested' } });
    }

    // 2. Promote to admin
    if (user.role === 'admin') {
      sendEmail(user.email, {
        subject: 'Congratulation for Adminship',
        message:
          'You are now an admin of our TechInsights website. Please follow the community rules.',
      });

      return await User.updateOne(query, {
        $set: {
          role: 'admin',
          status: 'verified',
          subscription: 'premium',
        },
      });
    }

    // 3. Remove admin
    if (user.status === 'remove-admin') {
      sendEmail(user.email, {
        subject: 'Adminship cancelled',
        message:
          'You are now no longer an admin of our TechInsights website. Please reach out to us to know more.',
      });

      return await User.updateOne(query, {
        $set: {
          status: 'verified',
          role: 'user',
          subscription: 'usual',
        },
      });
    }

    // 4. Subscribe to premium
    if (user.subscription === 'premium') {
      return await User.updateOne(query, {
        $set: {
          subscription: 'premium',
          premiumToken:
            Math.floor(new Date().getTime() / 1000) + user.validationTime,
        },
      });
    }

    // 5. Already exists
    return {
      message: 'User already exists',
      insertedId: null,
    };
  }

  // 6. Create new user
  const updateDoc = { $set: { ...user } };
  const result = await User.updateOne(query, updateDoc, options);

  sendEmail(user.email, {
    subject: 'Welcome to TechInsights',
    message: `Dear friend, your registration in TechInsights website is successful. Stay connected with us, hope you'll enjoy the journey.`,
  });

  return result;
};