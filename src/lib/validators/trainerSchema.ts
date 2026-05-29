import { z } from "zod";

export const trainerInputSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  surname: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email(),
  specialty: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

export type TrainerInput = z.infer<typeof trainerInputSchema>;
