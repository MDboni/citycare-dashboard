import { z } from "zod";

/** Mirrors `modules/user/user.validation.ts` — at least one field must change. */
export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(80, "Name is too long")
      .optional(),
    phone: z
      .string()
      .trim()
      .max(20, "Phone number is too long")
      .optional()
      .or(z.literal("")),
    wardId: z.uuid().optional().or(z.literal("")),
  })
  .refine(
    (value) => Object.values(value).some((v) => v !== undefined && v !== ""),
    { message: "Change something before saving" },
  );

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
