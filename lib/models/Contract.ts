import mongoose, { Schema, Document } from "mongoose";

const LinkSchema = new Schema(
  { id: String, name: String, url: String },
  { _id: false }
);

export interface IContract extends Document {
  username: string;
  client: string;
  title: string;
  description: string;
  workingHours: string;
  rating: number | null;
  positiveReviews: string;
  negativeReviews: string;
  currency: string;
  contractValue: string;
  valueInDiscussion: boolean;
  durationValue: string;
  durationUnit: "days" | "weeks" | "months" | "years";
  durationInDiscussion: boolean;
  completionStatus: "on_time" | "over_time" | "under_time" | null;
  type: "pending" | "active" | "completed" | "cancelled";
  status: string | null;
  proposedOn: string | null;
  startDate: string | null;
  endDate: string | null;
  cancelledDate: string | null;
  links: { id: string; name: string; url: string }[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    username:            { type: String, required: true, index: true },
    client:              { type: String, required: true },
    title:               { type: String, required: true },
    description:         { type: String, default: "" },
    workingHours:        { type: String, default: "" },
    rating:              { type: Number, default: null },
    positiveReviews:     { type: String, default: "" },
    negativeReviews:     { type: String, default: "" },
    currency:            { type: String, default: "" },
    contractValue:       { type: String, default: "" },
    valueInDiscussion:   { type: Boolean, default: false },
    durationValue:       { type: String, default: "" },
    durationUnit:        { type: String, enum: ["days", "weeks", "months", "years"], default: "months" },
    durationInDiscussion:{ type: Boolean, default: false },
    completionStatus:    { type: String, enum: ["on_time", "over_time", "under_time", null], default: null },
    type:                { type: String, enum: ["pending", "active", "completed", "cancelled"], required: true },
    status:              { type: String, default: null },
    proposedOn:          { type: String, default: null },
    startDate:           { type: String, default: null },
    endDate:             { type: String, default: null },
    cancelledDate:       { type: String, default: null },
    links:               { type: [LinkSchema], default: [] },
    notes:               { type: String, default: "" },
  },
  { timestamps: true }
);

export const Contract =
  (mongoose.models.Contract as mongoose.Model<IContract>) ||
  mongoose.model<IContract>("Contract", ContractSchema);
