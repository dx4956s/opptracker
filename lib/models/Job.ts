import mongoose, { Schema, Document } from "mongoose";

const LinkSchema = new Schema(
  { id: String, name: String, url: String },
  { _id: false }
);

export interface IJob extends Document {
  username: string;
  company: string;
  role: string;
  description: string;
  workingHours: string;
  rating: number | null;
  positiveReviews: string;
  negativeReviews: string;
  currency: string;
  expectedPackage: string;
  salaryInDiscussion: boolean;
  type: "applied" | "working" | "left" | "rejected";
  status: string | null;
  appliedOn: string | null;
  startDate: string | null;
  endDate: string | null;
  rejectedDate: string | null;
  links: { id: string; name: string; url: string }[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    username:           { type: String, required: true, index: true },
    company:            { type: String, required: true },
    role:               { type: String, required: true },
    description:        { type: String, default: "" },
    workingHours:       { type: String, default: "" },
    rating:             { type: Number, default: null },
    positiveReviews:    { type: String, default: "" },
    negativeReviews:    { type: String, default: "" },
    currency:           { type: String, default: "" },
    expectedPackage:    { type: String, default: "" },
    salaryInDiscussion: { type: Boolean, default: false },
    type:               { type: String, enum: ["applied", "working", "left", "rejected"], required: true },
    status:             { type: String, default: null },
    appliedOn:          { type: String, default: null },
    startDate:          { type: String, default: null },
    endDate:            { type: String, default: null },
    rejectedDate:       { type: String, default: null },
    links:              { type: [LinkSchema], default: [] },
    notes:              { type: String, default: "" },
  },
  { timestamps: true }
);

export const Job =
  (mongoose.models.Job as mongoose.Model<IJob>) ||
  mongoose.model<IJob>("Job", JobSchema);
