import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const COURSE_MODES = ["live_online", "on_site", "self_paced"] as const;
export type CourseMode = (typeof COURSE_MODES)[number];

export const COURSE_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;

const CourseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, trim: true, maxlength: 400 },
    description: { type: String, trim: true, maxlength: 5000 },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },

    modes: { type: [{ type: String, enum: COURSE_MODES }], default: ["live_online", "on_site"] },
    level: { type: String, enum: COURSE_LEVELS, default: "intermediate" },
    durationDays: { type: Number, required: true, min: 0.5, max: 60 },

    priceTnd: { type: Number, default: 0, min: 0 },
    coinReward: { type: Number, default: 50, min: 0 },
    isGame: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false, index: true },

    coverImageUrl: { type: String, trim: true },
    learningOutcomes: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },

    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

CourseSchema.index({ title: "text", code: "text", summary: "text" });
CourseSchema.index({ category: 1, isPublished: 1 });

export type CourseDoc = InferSchemaType<typeof CourseSchema> & { _id: unknown };

export const Course: Model<CourseDoc> =
  (models.Course as Model<CourseDoc>) || model<CourseDoc>("Course", CourseSchema);
