import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const RESERVATION_STATUSES = ["pending", "approved", "rejected", "cancelled", "attended", "no_show"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

const ReservationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    session: { type: Schema.Types.ObjectId, ref: "Session", required: true, index: true },
    status: { type: String, enum: RESERVATION_STATUSES, default: "pending", index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 600 },
  },
  { timestamps: true },
);

// One reservation per (user, session)
ReservationSchema.index({ user: 1, session: 1 }, { unique: true });

export type ReservationDoc = InferSchemaType<typeof ReservationSchema> & { _id: unknown };

export const Reservation: Model<ReservationDoc> =
  (models.Reservation as Model<ReservationDoc>) || model<ReservationDoc>("Reservation", ReservationSchema);
