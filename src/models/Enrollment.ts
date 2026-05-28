import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ENROLLMENT_STATUSES = ["active", "completed", "abandoned"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

const EnrollmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    status: { type: String, enum: ENROLLMENT_STATUSES, default: "active", index: true },

    /** 0–100 percent progress across modules/lessons. */
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date },

    /** Set once the system credited the wallet for completing this course. Prevents re-farming. */
    coinsAwarded: { type: Boolean, default: false },
    coinsAwardedAt: { type: Date },
  },
  { timestamps: true },
);

// A user can only be enrolled once per course
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export type EnrollmentDoc = InferSchemaType<typeof EnrollmentSchema> & { _id: unknown };

export const Enrollment: Model<EnrollmentDoc> =
  (models.Enrollment as Model<EnrollmentDoc>) || model<EnrollmentDoc>("Enrollment", EnrollmentSchema);
