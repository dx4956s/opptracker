import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: "admin" | "user";
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username:     { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ["admin", "user"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
