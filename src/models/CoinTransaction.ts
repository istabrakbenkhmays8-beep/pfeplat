import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const COIN_REASONS = [
  "course_completion",
  "assessment_pass",
  "game_score",
  "streak_bonus",
  "admin_grant",
  "purchase_discount",
  "refund",
] as const;
export type CoinReason = (typeof COIN_REASONS)[number];

const CoinTransactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    /** Positive for earned coins, negative for spent. */
    delta: { type: Number, required: true },
    reason: { type: String, enum: COIN_REASONS, required: true, index: true },
    balanceAfter: { type: Number, required: true, min: 0 },

    course: { type: Schema.Types.ObjectId, ref: "Course" },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    note: { type: String, trim: true, maxlength: 400 },
  },
  { timestamps: true },
);

CoinTransactionSchema.index({ user: 1, createdAt: -1 });

export type CoinTransactionDoc = InferSchemaType<typeof CoinTransactionSchema> & { _id: unknown };

export const CoinTransaction: Model<CoinTransactionDoc> =
  (models.CoinTransaction as Model<CoinTransactionDoc>) ||
  model<CoinTransactionDoc>("CoinTransaction", CoinTransactionSchema);
