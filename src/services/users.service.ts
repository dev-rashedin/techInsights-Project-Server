import { NotFoundError } from "express-error-toolkit";
import { User, IUser } from "../model/users.model";

// fetch all users from database
export const fetchAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

export const fetchUserByEmail = async (
  email: string,
): Promise<IUser | null> => {
  const result = await User.findOne({ email });
  if (!result) throw new NotFoundError("user not found");
  return result;
};

export const upsertUser = async (
  userData: Partial<IUser>,
): Promise<IUser | null> => {
  return await User.findOneAndUpdate(
    { email: userData.email },
    { $set: userData },
    { upsert: true, new: true },
  );
};

export const updateUserByEmail = async (
  email: string,
  updateData: Partial<IUser>,
) => {
  return await User.updateOne({ email }, { $set: updateData });
};
