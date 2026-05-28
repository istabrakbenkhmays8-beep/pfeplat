import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const CertificateSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    serial: { type: String, required: true, unique: true, index: true },
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String, trim: true },
    revokedAt: { type: Date },
    revokeReason: { type: String, trim: true, maxlength: 400 },
  },
  { timestamps: true },
);

// One issued certificate per (user, course)
CertificateSchema.index({ user: 1, course: 1 }, { unique: true });

export type CertificateDoc = InferSchemaType<typeof CertificateSchema> & { _id: unknown };

export const Certificate: Model<CertificateDoc> =
  (models.Certificate as Model<CertificateDoc>) || model<CertificateDoc>("Certificate", CertificateSchema);
