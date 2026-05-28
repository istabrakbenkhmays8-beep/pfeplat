import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const SESSION_MODES = ["live_online", "on_site"] as const;
export type SessionMode = (typeof SESSION_MODES)[number];

export const SESSION_STATUSES = ["draft", "scheduled", "confirmed", "in_progress", "completed", "cancelled"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

const SessionSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    trainer: { type: Schema.Types.ObjectId, ref: "Trainer" },

    mode: { type: String, enum: SESSION_MODES, required: true },
    status: { type: String, enum: SESSION_STATUSES, default: "scheduled", index: true },

    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true },

    capacity: { type: Number, default: 12, min: 1, max: 200 },
    enrolledCount: { type: Number, default: 0, min: 0 },

    location: { type: String, trim: true, maxlength: 200 },
    meetingLink: { type: String, trim: true, maxlength: 500 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

SessionSchema.index({ startsAt: 1, status: 1 });
SessionSchema.index({ course: 1, startsAt: 1 });

export type SessionDoc = InferSchemaType<typeof SessionSchema> & { _id: unknown };

export const Session: Model<SessionDoc> =
  (models.Session as Model<SessionDoc>) || model<SessionDoc>("Session", SessionSchema);
