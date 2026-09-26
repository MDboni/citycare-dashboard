import type {
  AuthProvider,
  ComplaintStatus,
  Priority,
  Role,
  SecurityEventType,
  UserStatus,
} from "./enums.types";

/**
 * A row in `GET /admin/users`, as the endpoint actually returns it. `avatarUrl`,
 * `emailVerifiedAt` and `deletedAt` are not in its select, so they are optional
 * here rather than claimed present and read as undefined.
 */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  provider: AuthProvider;
  twoFactorEnabled: boolean;
  isSuperAdmin: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  department: { id: string; name: string } | null;
  ward: { id: string; number: number; name: string } | null;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
  deletedAt?: string | null;
};

/** `GET /admin/dashboard-stats` — cached server-side, so it is cheap to poll. */
export type DashboardStats = {
  totals: {
    complaints: number;
    open: number;
    escalated: number;
    users: number;
  };
  byStatus: { status: ComplaintStatus; count: number }[];
  byPriority: { priority: Priority; count: number }[];
  byWard: { wardId: string; ward: string; count: number }[];
  topCategories: { categoryId: string; category: string; count: number }[];
  avgResolutionHours: number | null;
  payments: {
    today: { count: number; amount: string };
    month: { count: number; amount: string };
  };
};

/** `GET /officer/stats` — the same idea, scoped to one officer. */
export type OfficerStats = {
  assigned: number;
  inProgress: number;
  resolvedThisMonth: number;
  slaBreaches: number;
  avgRating: number | null;
  ratingCount: number;
};

export type SlaReportRow = {
  department: string;
  total: number;
  breached: number;
  breachPercent: number;
  avgResolutionHours: number | null;
  avgRating: number | null;
};

export type AuditLog = {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: Role } | null;
};

export type SecurityEvent = {
  id: string;
  userId: string | null;
  email: string | null;
  type: SecurityEventType;
  ip: string | null;
  userAgent: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

/** The five tunables `PATCH /admin/settings/:key` will accept. */
export const SETTING_KEYS = [
  "REOPEN_LIMIT",
  "REOPEN_WINDOW_DAYS",
  "URGENT_SLA_FACTOR",
  "LOGIN_OTP_TTL_SEC",
  "SIGNUP_OTP_TTL_SEC",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

/** `GET /admin/settings` returns the stored value alongside the built-in default. */
export type SystemSetting = {
  key: string;
  value: number | string;
  default: number;
  updatedAt: string | null;
};

export const RESTORABLE_ENTITIES = [
  "complaint",
  "user",
  "category",
  "department",
] as const;

export type RestorableEntity = (typeof RESTORABLE_ENTITIES)[number];
