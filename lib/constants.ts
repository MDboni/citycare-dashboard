import type {
  ComplaintStatus,
  PaymentStatus,
  Priority,
  Role,
  ServiceRequestStatus,
  UserStatus,
} from "@/types";

/**
 * One place decides how a status looks, so the same complaint reads the same in
 * a table row, a detail header and a timeline. `tone` is a full set of classes
 * rather than a colour name because the soft-fill chip needs text, background
 * and ring to move together.
 */
export type StatusMeta = {
  label: string;
  tone: string;
  /** Feeds `--color-chart-*` lookups and the progress rail. */
  accent: string;
};

export const COMPLAINT_STATUS_META: Record<ComplaintStatus, StatusMeta> = {
  SUBMITTED: {
    label: "Submitted",
    tone: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    accent: "bg-muted-foreground",
  },
  UNDER_REVIEW: {
    label: "Under review",
    tone: "bg-info/10 text-info ring-1 ring-inset ring-info/25",
    accent: "bg-info",
  },
  ASSIGNED: {
    label: "Assigned",
    tone: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25",
    accent: "bg-primary",
  },
  IN_PROGRESS: {
    label: "In progress",
    tone: "bg-warning/15 text-warning-foreground ring-1 ring-inset ring-warning/35 dark:text-warning",
    accent: "bg-warning",
  },
  RESOLVED: {
    label: "Resolved",
    tone: "bg-success/10 text-success ring-1 ring-inset ring-success/25",
    accent: "bg-success",
  },
  CLOSED: {
    label: "Closed",
    tone: "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border",
    accent: "bg-secondary-foreground",
  },
  REOPENED: {
    label: "Reopened",
    tone: "bg-chart-4/12 text-chart-4 ring-1 ring-inset ring-chart-4/30",
    accent: "bg-chart-4",
  },
  REJECTED: {
    label: "Rejected",
    tone: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25",
    accent: "bg-destructive",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "bg-muted text-muted-foreground ring-1 ring-inset ring-border line-through decoration-muted-foreground/40",
    accent: "bg-muted-foreground",
  },
};

export const PRIORITY_META: Record<Priority, StatusMeta> = {
  LOW: {
    label: "Low",
    tone: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    accent: "bg-muted-foreground",
  },
  MEDIUM: {
    label: "Medium",
    tone: "bg-info/10 text-info ring-1 ring-inset ring-info/25",
    accent: "bg-info",
  },
  HIGH: {
    label: "High",
    tone: "bg-warning/15 text-warning-foreground ring-1 ring-inset ring-warning/35 dark:text-warning",
    accent: "bg-warning",
  },
  URGENT: {
    label: "Urgent",
    tone: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25",
    accent: "bg-destructive",
  },
};

export const SERVICE_REQUEST_STATUS_META: Record<
  ServiceRequestStatus,
  StatusMeta
> = {
  PENDING_PAYMENT: {
    label: "Payment due",
    tone: "bg-warning/15 text-warning-foreground ring-1 ring-inset ring-warning/35 dark:text-warning",
    accent: "bg-warning",
  },
  PAID: {
    label: "Paid",
    tone: "bg-info/10 text-info ring-1 ring-inset ring-info/25",
    accent: "bg-info",
  },
  PROCESSING: {
    label: "Processing",
    tone: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25",
    accent: "bg-primary",
  },
  COMPLETED: {
    label: "Completed",
    tone: "bg-success/10 text-success ring-1 ring-inset ring-success/25",
    accent: "bg-success",
  },
  REJECTED: {
    label: "Rejected",
    tone: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25",
    accent: "bg-destructive",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    accent: "bg-muted-foreground",
  },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  PENDING: {
    label: "Pending",
    tone: "bg-warning/15 text-warning-foreground ring-1 ring-inset ring-warning/35 dark:text-warning",
    accent: "bg-warning",
  },
  SUCCESS: {
    label: "Paid",
    tone: "bg-success/10 text-success ring-1 ring-inset ring-success/25",
    accent: "bg-success",
  },
  FAILED: {
    label: "Failed",
    tone: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25",
    accent: "bg-destructive",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    accent: "bg-muted-foreground",
  },
  REFUNDED: {
    label: "Refunded",
    tone: "bg-chart-4/12 text-chart-4 ring-1 ring-inset ring-chart-4/30",
    accent: "bg-chart-4",
  },
};

export const USER_STATUS_META: Record<UserStatus, StatusMeta> = {
  ACTIVE: {
    label: "Active",
    tone: "bg-success/10 text-success ring-1 ring-inset ring-success/25",
    accent: "bg-success",
  },
  BLOCKED: {
    label: "Blocked",
    tone: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/25",
    accent: "bg-destructive",
  },
};

export const ROLE_META: Record<Role, StatusMeta> = {
  CITIZEN: {
    label: "Citizen",
    tone: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    accent: "bg-muted-foreground",
  },
  OFFICER: {
    label: "Officer",
    tone: "bg-info/10 text-info ring-1 ring-inset ring-info/25",
    accent: "bg-info",
  },
  ADMIN: {
    label: "Admin",
    tone: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25",
    accent: "bg-primary",
  },
};

/**
 * The client-side mirror of `complaint.constants.ts`. It decides which buttons
 * to render; the server still decides what actually happens, so the two
 * disagreeing costs a 409 and nothing worse.
 */
export const COMPLAINT_TRANSITIONS: Record<
  ComplaintStatus,
  { to: ComplaintStatus; roles: Role[] }[]
> = {
  SUBMITTED: [
    { to: "UNDER_REVIEW", roles: ["ADMIN"] },
    { to: "CANCELLED", roles: ["CITIZEN"] },
  ],
  UNDER_REVIEW: [
    { to: "ASSIGNED", roles: ["ADMIN"] },
    { to: "REJECTED", roles: ["ADMIN"] },
  ],
  ASSIGNED: [{ to: "IN_PROGRESS", roles: ["OFFICER"] }],
  IN_PROGRESS: [{ to: "RESOLVED", roles: ["OFFICER"] }],
  RESOLVED: [
    { to: "CLOSED", roles: ["CITIZEN", "ADMIN"] },
    { to: "REOPENED", roles: ["CITIZEN"] },
  ],
  REOPENED: [{ to: "ASSIGNED", roles: ["ADMIN"] }],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
};

export const allowedTransitions = (
  from: ComplaintStatus,
  role: Role,
): ComplaintStatus[] =>
  COMPLAINT_TRANSITIONS[from]
    .filter((edge) => edge.roles.includes(role))
    .map((edge) => edge.to);

/** The statuses that still need somebody's attention. */
export const OPEN_COMPLAINT_STATUSES: ComplaintStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "IN_PROGRESS",
  "REOPENED",
];

/** Upload limits, copied from `middlewares/upload.ts`. */
export const MAX_FILE_SIZE = 4 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const DOCUMENT_MIME_TYPES = [...IMAGE_MIME_TYPES, "application/pdf"];

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const TRACKING_ID_PATTERN = /^CC-\d{4}-\d{6}$/;
