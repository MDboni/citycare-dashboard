import { z } from "zod";
import { TRACKING_ID_PATTERN } from "@/lib/constants";

/** Mirrors `modules/complaint/complaint.validation.ts`. */

export const createComplaintSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Give the issue a short title (5+ characters)")
    .max(150, "Keep the title under 150 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Describe the issue in at least 10 characters")
    .max(5000, "Description is too long"),
  categoryId: z.uuid("Pick a category"),
  wardId: z.uuid("Pick your ward"),
  address: z
    .string()
    .trim()
    .min(3, "Where is it? Add a street or landmark")
    .max(300, "Address is too long"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const updateComplaintSchema = z
  .object({
    title: z.string().trim().min(5).max(150).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    address: z.string().trim().min(3).max(300).optional(),
  })
  .refine((value) => Object.values(value).some((v) => v !== undefined), {
    message: "Change something before saving",
  });

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write a comment first")
    .max(2000, "Comment is too long"),
  isInternal: z.boolean().optional().default(false),
});

export const feedbackSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Pick a rating from 1 to 5")
    .max(5, "Pick a rating from 1 to 5"),
  comment: z.string().trim().max(1000, "Comment is too long").optional(),
});

export const noteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(2, "Add a short reason")
    .max(500, "Keep it under 500 characters")
    .optional()
    .or(z.literal("")),
});

export const changeStatusSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "REOPENED",
    "REJECTED",
    "CANCELLED",
  ]),
  note: z.string().trim().min(2).max(500).optional().or(z.literal("")),
});

export const trackSchema = z.object({
  trackingId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(TRACKING_ID_PATTERN, "Tracking ids look like CC-2026-000123"),
});

export type CreateComplaintValues = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintValues = z.infer<typeof updateComplaintSchema>;
export type CommentValues = z.input<typeof commentSchema>;
export type FeedbackValues = z.infer<typeof feedbackSchema>;
export type NoteValues = z.infer<typeof noteSchema>;
export type ChangeStatusValues = z.infer<typeof changeStatusSchema>;
export type TrackValues = z.infer<typeof trackSchema>;
