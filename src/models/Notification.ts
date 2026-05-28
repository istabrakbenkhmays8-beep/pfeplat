import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * In-app notification. Plain Mongo docs — surfaced via the bell icon in the
 * header. Triggers we currently emit:
 *   - reservation_approved / reservation_rejected (super admin decided)
 *   - reservation_created  (a user requested a seat — for admins)
 *   - course_completed     (learner finished a course)
 *   - trainer_assigned     (kept for future)
 *   - generic              (catch-all)
 */
export const NOTIFICATION_TYPES = [
  "reservation_approved",
  "reservation_rejected",
  "reservation_created",
  "course_completed",
  "trainer_assigned",
  "generic",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const NotificationSchema = new Schema(
  {
    /** Recipient. We look up by this. */
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: "generic", required: true },
    /** Short headline shown in the dropdown row. Plain language. */
    title: { type: String, required: true, trim: true, maxlength: 140 },
    /** Optional one-or-two-line body. */
    body: { type: String, trim: true, maxlength: 600 },
    /** Optional deep link into the app, e.g. `/my-courses` or `/super-admin/reservations`. */
    link: { type: String, trim: true, maxlength: 400 },
    /** When the user clicked / opened it. Null = still unread. */
    readAt: { type: Date, default: null, index: true },
    /** Free-form tags so we can later filter or attach context (reservationId, sessionId, etc). */
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

// Most queries are "give me the most recent N for this user".
NotificationSchema.index({ user: 1, createdAt: -1 });

export type NotificationDoc = InferSchemaType<typeof NotificationSchema> & { _id: unknown };

export const Notification: Model<NotificationDoc> =
  (models.Notification as Model<NotificationDoc>) ||
  model<NotificationDoc>("Notification", NotificationSchema);
