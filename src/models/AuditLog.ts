import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const AUDIT_ACTIONS = [
  "user.created",
  "user.updated",
  "user.disabled",
  "user.role_changed",
  "course.created",
  "course.updated",
  "course.published",
  "session.created",
  "session.confirmed",
  "session.cancelled",
  "trainer.assigned",
  "reservation.approved",
  "reservation.rejected",
  "payment.captured",
  "ai.tool_invoked",
  "ai.action_executed",
  "settings.updated",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

const AuditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String },
    action: { type: String, enum: AUDIT_ACTIONS, required: true, index: true },

    targetType: { type: String, trim: true, maxlength: 80 },
    targetId: { type: Schema.Types.ObjectId },

    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },

    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true, maxlength: 400 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actor: 1, createdAt: -1 });

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema> & { _id: unknown };

export const AuditLog: Model<AuditLogDoc> =
  (models.AuditLog as Model<AuditLogDoc>) || model<AuditLogDoc>("AuditLog", AuditLogSchema);
