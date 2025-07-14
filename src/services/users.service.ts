import User, { IUser } from "../model/users.model";

export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email });
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
