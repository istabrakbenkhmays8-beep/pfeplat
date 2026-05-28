import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["visitor", "user", "admin", "super_admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["pending_verification", "active", "disabled", "banned"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const GENDERS = ["male", "female", "prefer_not_to_say"] as const;
export const LEARNER_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    surname: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "user", index: true },
    status: { type: String, enum: USER_STATUSES, default: "pending_verification", index: true },

    gender: { type: String, enum: GENDERS, default: "prefer_not_to_say" },
    age: { type: Number, min: 10, max: 120 },
    country: { type: String, trim: true, maxlength: 80 },
    level: { type: String, enum: LEARNER_LEVELS, default: "beginner" },

    walletCoins: { type: Number, default: 0, min: 0 },
    avatarUrl: { type: String, trim: true },

    lastLoginAt: { type: Date },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ country: 1 });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: unknown };

export const User: Model<UserDoc> = (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
