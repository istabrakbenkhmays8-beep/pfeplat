import { z } from "zod";
import { COURSE_LEVELS, COURSE_MODES } from "@/src/models";

export const courseInputSchema = z.object({
  code: z.string().trim().toUpperCase().min(2).max(40),
  title: z.string().trim().min(2).max(200),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  categorySlug: z.string().trim().min(1),
  modes: z.array(z.enum(COURSE_MODES)).min(1),
  level: z.enum(COURSE_LEVELS),
  durationDays: z.coerce.number().min(0.5).max(60),
  priceTnd: z.coerce.number().min(0).default(0),
  coinReward: z.coerce.number().min(0).default(50),
  isFeatured: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(true),
});

export type CourseInput = z.infer<typeof courseInputSchema>;
