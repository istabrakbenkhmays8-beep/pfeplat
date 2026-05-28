import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const AnswerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    selectedOptionIds: { type: [Schema.Types.ObjectId], default: [] },
    text: { type: String, trim: true, maxlength: 500 },
    isCorrect: { type: Boolean, default: false },
    pointsAwarded: { type: Number, default: 0 },
  },
  { _id: false },
);

const AssessmentResultSchema = new Schema(
  {
    assessment: { type: Schema.Types.ObjectId, ref: "Assessment", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    attempt: { type: Number, default: 1, min: 1 },

    score: { type: Number, default: 0, min: 0, max: 100 },
    passed: { type: Boolean, default: false, index: true },
    answers: { type: [AnswerSchema], default: [] },

    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeTakenSeconds: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

AssessmentResultSchema.index({ user: 1, assessment: 1, attempt: 1 }, { unique: true });

export type AssessmentResultDoc = InferSchemaType<typeof AssessmentResultSchema> & { _id: unknown };

export const AssessmentResult: Model<AssessmentResultDoc> =
  (models.AssessmentResult as Model<AssessmentResultDoc>) ||
  model<AssessmentResultDoc>("AssessmentResult", AssessmentResultSchema);
