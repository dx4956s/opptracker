import mongoose, { Schema, Document } from "mongoose";

const LinkSchema = new Schema(
  { id: String, name: String, url: String },
  { _id: false }
);

export interface IFreelance extends Document {
  username: string;
  client: string;
  title: string;
  description: string;
  rating: number | null;
  positiveReviews: string;
  negativeReviews: string;
  currency: string;
  hourlyRate: string;
  hoursPerDay: string;
  totalEarnings: string | null;
  type: "bidding" | "in_progress" | "completed" | "lost";
  status: string | null;
  bidDate: string | null;
  startDate: string | null;
  endDate: string | null;
  lostDate: string | null;
  links: { id: string; name: string; url: string }[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const FreelanceSchema = new Schema<IFreelance>(
  {
    username:       { type: String, required: true, index: true },
    client:         { type: String, required: true },
    title:          { type: String, required: true },
    description:    { type: String, default: "" },
    rating:         { type: Number, default: null },
    positiveReviews:{ type: String, default: "" },
    negativeReviews:{ type: String, default: "" },
    currency:       { type: String, default: "" },
    hourlyRate:     { type: String, default: "" },
    hoursPerDay:    { type: String, default: "" },
    totalEarnings:  { type: String, default: null },
    type:           { type: String, enum: ["bidding", "in_progress", "completed", "lost"], required: true },
    status:         { type: String, default: null },
    bidDate:        { type: String, default: null },
    startDate:      { type: String, default: null },
    endDate:        { type: String, default: null },
    lostDate:       { type: String, default: null },
    links:          { type: [LinkSchema], default: [] },
    notes:          { type: String, default: "" },
  },
  { timestamps: true }
);

export const Freelance =
  (mongoose.models.Freelance as mongoose.Model<IFreelance>) ||
  mongoose.model<IFreelance>("Freelance", FreelanceSchema);
