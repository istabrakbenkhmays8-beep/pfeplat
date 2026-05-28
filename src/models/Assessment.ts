import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const QUESTION_TYPES = ["single_choice", "multi_choice", "true_false", "short_text"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

const QuestionSchema = new Schema(
  {
    prompt: { type: String, required: true, trim: true, maxlength: 1000 },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    options: { type: [{ text: String, isCorrect: Boolean }], default: [] },
    correctText: { type: String, trim: true, maxlength: 500 },
    points: { type: Number, default: 1, min: 0 },
    explanation: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: true },
);

const AssessmentSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },

    passThreshold: { type: Number, default: 70, min: 0, max: 100 },
    timeLimitMinutes: { type: Number, default: 30, min: 1, max: 240 },
    maxAttempts: { type: Number, default: 3, min: 1, max: 10 },

    questions: { type: [QuestionSchema], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type AssessmentDoc = InferSchemaType<typeof AssessmentSchema> & { _id: unknown };

export const Assessment: Model<AssessmentDoc> =
  (models.Assessment as Model<AssessmentDoc>) || model<AssessmentDoc>("Assessment", AssessmentSchema);
