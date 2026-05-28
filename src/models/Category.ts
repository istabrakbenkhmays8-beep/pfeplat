import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const VENDORS = [
  "Cisco",
  "Fortinet",
  "Microsoft",
  "PaloAlto",
  "IBM",
  "EC-Council",
  "PECB",
  "PeopleCert",
  "PMI",
  "Togaf",
  "Linux",
  "VMware",
  "AWS",
  "Kaspersky",
  "CertNexus",
] as const;

const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    vendor: { type: String, enum: VENDORS, required: true, index: true },
    group: { type: String, required: true, trim: true, maxlength: 80, index: true },
    description: { type: String, trim: true, maxlength: 600 },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof CategorySchema> & { _id: unknown };

export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model<CategoryDoc>("Category", CategorySchema);
