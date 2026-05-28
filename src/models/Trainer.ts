import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const TrainerSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    surname: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    specialty: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 1000 },
    country: { type: String, trim: true, maxlength: 80 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

TrainerSchema.index({ specialty: 1 });

export type TrainerDoc = InferSchemaType<typeof TrainerSchema> & { _id: unknown };

export const Trainer: Model<TrainerDoc> =
  (models.Trainer as Model<TrainerDoc>) || model<TrainerDoc>("Trainer", TrainerSchema);
