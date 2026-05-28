import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const EMAIL_TOKEN_TYPES = ["verify_email", "reset_password"] as const;
export type EmailTokenType = (typeof EMAIL_TOKEN_TYPES)[number];

const EmailTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    /** SHA-256 hash of the token; the raw token is only ever in the email. */
    tokenHash: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: EMAIL_TOKEN_TYPES, required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true, maxlength: 400 },
  },
  { timestamps: true },
);

// TTL index — Mongo auto-deletes after expiry.
EmailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type EmailTokenDoc = InferSchemaType<typeof EmailTokenSchema> & { _id: unknown };

export const EmailToken: Model<EmailTokenDoc> =
  (models.EmailToken as Model<EmailTokenDoc>) || model<EmailTokenDoc>("EmailToken", EmailTokenSchema);
