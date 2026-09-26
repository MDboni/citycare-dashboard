/** Mirrors prisma/schema/enums.prisma — keep the two in step. */

export const ROLES = ["CITIZEN", "OFFICER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "BLOCKED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AUTH_PROVIDERS = ["LOCAL", "GOOGLE"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const COMPLAINT_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "REJECTED",
  "CANCELLED",
] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const SERVICE_REQUEST_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
] as const;
export type ServiceRequestStatus = (typeof SERVICE_REQUEST_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SECURITY_EVENT_TYPES = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "OTP_SENT",
  "OTP_FAILED",
  "ACCOUNT_LOCKED",
  "NEW_DEVICE",
  "TOKEN_REUSE",
  "PASSWORD_CHANGED",
  "TWO_FA_TOGGLED",
  "ROLE_CHANGED",
  "SESSION_REVOKED",
] as const;
export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number];

export const ATTACHMENT_KINDS = ["EVIDENCE", "RESOLUTION_PROOF"] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const REFUND_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "PROCESSED",
  "REJECTED",
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];
