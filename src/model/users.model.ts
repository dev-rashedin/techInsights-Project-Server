import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  role?: string;
  status?: string;
  subscription?: string;
  premiumToken?: number | null;
  // Add other fields as needed
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "user" },
    status: { type: String, default: "verified" },
    subscription: { type: String, default: "usual" },
    premiumToken: { type: Number, default: null },
    // Add other fields as needed
  },
  { timestamps: true },
);

const User = model<IUser>("User", userSchema);

export default User;
