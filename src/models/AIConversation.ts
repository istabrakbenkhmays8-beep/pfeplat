import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const AI_SCOPES = ["user", "admin", "super_admin"] as const;
export type AiScope = (typeof AI_SCOPES)[number];

const ToolCallSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    args: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    executedAt: { type: Date },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } },
);

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system", "tool"], required: true },
    content: { type: String },
    toolCalls: { type: [ToolCallSchema], default: [] },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } },
);

const AIConversationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scope: { type: String, enum: AI_SCOPES, required: true, index: true },
    title: { type: String, trim: true, maxlength: 200 },
    messages: { type: [MessageSchema], default: [] },
    lastMessageAt: { type: Date, index: true },
  },
  { timestamps: true },
);

AIConversationSchema.index({ user: 1, scope: 1, lastMessageAt: -1 });

export type AIConversationDoc = InferSchemaType<typeof AIConversationSchema> & { _id: unknown };

export const AIConversation: Model<AIConversationDoc> =
  (models.AIConversation as Model<AIConversationDoc>) ||
  model<AIConversationDoc>("AIConversation", AIConversationSchema);
