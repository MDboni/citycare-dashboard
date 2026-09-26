import { z } from "zod";

/**
 * `details` is a free-form JSON payload server-side, because it varies per
 * service type. The form collects it as flat key/value pairs, which is the most
 * an app can offer without a per-service schema registry.
 */
export const createServiceRequestSchema = z.object({
  serviceTypeId: z.uuid("Pick a service"),
  details: z
    .array(
      z.object({
        key: z
          .string()
          .trim()
          .min(1, "Name this field")
          .max(60, "Field name is too long"),
        value: z.string().trim().max(500, "Value is too long"),
      }),
    )
    .max(20, "That is more detail than this form takes")
    .optional(),
});

export const uploadDocumentSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Label the document (2+ characters)")
    .max(80, "Label is too long"),
});

export type CreateServiceRequestValues = z.infer<
  typeof createServiceRequestSchema
>;
export type UploadDocumentValues = z.infer<typeof uploadDocumentSchema>;
