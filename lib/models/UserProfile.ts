import mongoose, { Schema, Document } from "mongoose";

const ResumeLinkSchema = new Schema(
  { id: String, name: String, url: String },
  { _id: false }
);

export interface IUserProfile extends Document {
  username: string;
  displayName: string;
  intro: string;
  resumeLinks: { id: string; name: string; url: string }[];
  avatarUrl: string;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    username:    { type: String, required: true, unique: true },
    displayName: { type: String, default: "" },
    intro:       { type: String, default: "" },
    resumeLinks: { type: [ResumeLinkSchema], default: [] },
    avatarUrl:   { type: String, default: "" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const UserProfile =
  (mongoose.models.UserProfile as mongoose.Model<IUserProfile>) ||
  mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
