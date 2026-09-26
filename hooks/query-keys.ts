import type {
  AdminUserFilters,
  AuditLogFilters,
  ComplaintFilters,
  SecurityEventFilters,
  ServiceRequestFilters,
} from "@/api";

/**
 * Query keys in one file so an invalidation can never miss a list. Each key is
 * a tuple whose first element is the resource, which is what lets
 * `invalidateQueries({ queryKey: queryKeys.complaints.all })` sweep every
 * filtered variant of a list at once.
 */
export const queryKeys = {
  me: ["me"] as const,
  sessions: ["auth", "sessions"] as const,

  catalog: {
    departments: ["catalog", "departments"] as const,
    categories: ["catalog", "categories"] as const,
    wards: ["catalog", "wards"] as const,
    zones: ["catalog", "zones"] as const,
    serviceTypes: ["catalog", "service-types"] as const,
  },

  complaints: {
    all: ["complaints"] as const,
    mine: (filters: ComplaintFilters) =>
      ["complaints", "mine", filters] as const,
    list: (filters: ComplaintFilters) =>
      ["complaints", "list", filters] as const,
    assigned: (filters: ComplaintFilters) =>
      ["complaints", "assigned", filters] as const,
    detail: (id: string) => ["complaints", "detail", id] as const,
    comments: (id: string) => ["complaints", "comments", id] as const,
    tracking: (trackingId: string) =>
      ["complaints", "tracking", trackingId] as const,
    nearby: (lat: number, lng: number, radiusKm: number) =>
      ["complaints", "nearby", lat, lng, radiusKm] as const,
  },

  serviceRequests: {
    all: ["service-requests"] as const,
    mine: (filters: ServiceRequestFilters) =>
      ["service-requests", "mine", filters] as const,
    detail: (id: string) => ["service-requests", "detail", id] as const,
  },

  payments: {
    all: ["payments"] as const,
    mine: (page: number, limit: number) =>
      ["payments", "mine", page, limit] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    list: (page: number, unread: boolean) =>
      ["notifications", "list", page, unread] as const,
  },
} as const;

/**
 * The staff console adds its own resources. Kept as a second object rather than
 * folded into `queryKeys` so the shared file stays identical to the citizen
 * app's copy and can be diffed against it.
 */
export const adminKeys = {
  dashboardStats: ["admin", "dashboard-stats"] as const,
  officerStats: ["officer", "stats"] as const,
  allUsers: ["admin", "users"] as const,
  users: (filters: AdminUserFilters) => ["admin", "users", filters] as const,
  auditLogs: (filters: AuditLogFilters) =>
    ["admin", "audit-logs", filters] as const,
  securityEvents: (filters: SecurityEventFilters) =>
    ["admin", "security-events", filters] as const,
  slaReport: ["admin", "reports", "sla"] as const,
  settings: ["admin", "settings"] as const,
} as const;
