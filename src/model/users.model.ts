import { Schema, Document, model } from 'mongoose';

// 1. TypeScript interface for User
export interface IUser extends Document {
  email: string;
  displayName: string;
  photoURL: string;
  premiumToken: string | null;
  role: 'user' | 'admin';
  status: 'verified' | 'requested' | 'remove-admin' | 'banned';
  subscription: 'usual' | 'premium';
}

// 2. Mongoose schema definition
const userSchema: Schema<IUser> = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  photoURL: { type: String, required: true },
  premiumToken: { type: String, default: null },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['verified', 'requested', 'remove-admin', 'banned'],
    default: 'verified',
  },
  subscription: {
    type: String,
    enum: ['usual', 'premium'],
    default: 'usual',
  },
});

// 3. Model export
export const User = model<IUser>('User', userSchema);
