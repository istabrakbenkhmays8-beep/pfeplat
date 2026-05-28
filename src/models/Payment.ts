import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const PAYMENT_METHODS = ["card", "wallet", "card_plus_wallet"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["initiated", "pending", "succeeded", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_PROVIDERS = ["mock", "paymee", "konnect", "flouci"] as const;

const PaymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
    enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment" },

    provider: { type: String, enum: PAYMENT_PROVIDERS, default: "mock" },
    providerRef: { type: String, trim: true, index: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },

    amountTnd: { type: Number, required: true, min: 0 },
    coinsUsed: { type: Number, default: 0, min: 0 },

    status: { type: String, enum: PAYMENT_STATUSES, default: "initiated", index: true },
    failureReason: { type: String, trim: true, maxlength: 500 },

    paidAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true },
);

PaymentSchema.index({ status: 1, createdAt: -1 });

export type PaymentDoc = InferSchemaType<typeof PaymentSchema> & { _id: unknown };

export const Payment: Model<PaymentDoc> =
  (models.Payment as Model<PaymentDoc>) || model<PaymentDoc>("Payment", PaymentSchema);
