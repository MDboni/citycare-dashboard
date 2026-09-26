import { z } from "zod";

/**
 * These mirror `modules/auth/auth.validation.ts` on the server, rule for rule.
 * The point is not to replace the server check — it still runs — but to tell the
 * user which field is wrong before the request leaves the browser.
 */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "Email is required")
  .max(254, "Email is too long")
  .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email address");

/** 10+ chars with a lower case, an upper case, a digit and a symbol. */
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128, "Password is too long")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[0-9]/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a symbol");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6 digit code");

/**
 * The cross-field half of the server's password policy: the password may not
 * contain the local part of the email or any word from the name.
 */
const containsIdentity = (password: string, name: string, email: string) => {
  const lower = password.toLowerCase();
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (local.length >= 3 && lower.includes(local)) return true;
  return name
    .toLowerCase()
    .split(/\s+/)
    .some((part) => part.length >= 3 && lower.includes(part));
};

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(80, "Name is too long"),
    email: emailSchema,
    password: passwordSchema,
    phone: z
      .string()
      .trim()
      .max(20, "Phone number is too long")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (containsIdentity(value.password, value.name, value.email)) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must not contain your name or email",
      });
    }
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(128),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export const verifyLoginOtpSchema = z.object({
  otp: otpSchema,
  trustDevice: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(20, "This reset link is incomplete").max(256),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current one",
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const toggle2faSchema = z.object({
  enabled: z.boolean(),
  password: z.string().min(1, "Confirm with your password").max(128),
});

export type RegisterValues = z.input<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type VerifyLoginOtpValues = z.input<typeof verifyLoginOtpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type Toggle2faValues = z.infer<typeof toggle2faSchema>;
