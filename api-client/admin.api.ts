import { api, apiList, apiRequest, BASE_URL } from "@/lib/api-client";
import { getAccessToken } from "@/lib/session";
import type {
  AdminUser,
  AuditLog,
  DashboardStats,
  OfficerStats,
  RestorableEntity,
  Role,
  SecurityEvent,
  SecurityEventType,
  SettingKey,
  SlaReportRow,
  SystemSetting,
  UserStatus,
} from "@/types";

export type AdminUserFilters = {
  page?: number;
  limit?: number;
  role?: Role;
  status?: UserStatus;
  q?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type AuditLogFilters = {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type SecurityEventFilters = {
  page?: number;
  limit?: number;
  type?: SecurityEventType;
  ip?: string;
  from?: string;
  to?: string;
};

export type CsvReportFilters = {
  status?: string;
  wardId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

export const adminApi = {
  // --- people -------------------------------------------------------------
  users: (query: AdminUserFilters = {}) =>
    apiList<AdminUser>("/admin/users", { query }),

  /** No password: the officer sets one through the reset-password flow. */
  createOfficer: (body: {
    name: string;
    email: string;
    phone?: string;
    departmentId: string;
    wardId?: string;
  }) => api<AdminUser>("/admin/officers", { method: "POST", body }),

  updateRole: (id: string, body: { role: Role }) =>
    api<AdminUser>(`/admin/users/${id}/role`, { method: "PATCH", body }),

  updateStatus: (id: string, body: { status: UserStatus; reason?: string }) =>
    api<AdminUser>(`/admin/users/${id}/status`, { method: "PATCH", body }),

  /** Revokes every session that user holds, without touching the account. */
  forceLogout: (id: string) =>
    api<{ revoked: number }>(`/admin/users/${id}/sessions`, {
      method: "DELETE",
    }),

  // --- super admin only ---------------------------------------------------
  createAdmin: (body: { name: string; email: string; password: string }) =>
    api<AdminUser>("/admin/admins", { method: "POST", body }),

  removeAdmin: (id: string) =>
    apiRequest<unknown>(`/admin/admins/${id}`, { method: "DELETE" }),

  restore: (entity: RestorableEntity, id: string) =>
    apiRequest<unknown>(`/admin/restore/${entity}/${id}`, { method: "PATCH" }),

  securityEvents: (query: SecurityEventFilters = {}) =>
    apiList<SecurityEvent>("/admin/security-events", { query }),

  updateSetting: (key: SettingKey, value: number) =>
    api<SystemSetting>(`/admin/settings/${key}`, {
      method: "PATCH",
      body: { value },
    }),

  // --- dashboards and reports --------------------------------------------
  dashboardStats: () => api<DashboardStats>("/admin/dashboard-stats"),

  auditLogs: (query: AuditLogFilters = {}) =>
    apiList<AuditLog>("/admin/audit-logs", { query }),

  slaReport: () => api<SlaReportRow[]>("/admin/reports/sla"),

  settings: () => api<SystemSetting[]>("/admin/settings"),

  /**
   * The CSV endpoint streams a file rather than JSON, so it cannot go through
   * the usual client. It still needs the bearer token, which rules out a plain
   * `<a download>` — hence the fetch into a Blob.
   */
  downloadComplaintsCsv: async (filters: CsvReportFilters = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, String(value));
    }

    const query = params.toString();
    const response = await fetch(
      `${BASE_URL}/admin/reports/complaints.csv${query ? `?${query}` : ""}`,
      {
        headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Your session expired. Sign in again and retry the export."
          : `The export failed with status ${response.status}.`,
      );
    }

    return response.blob();
  },

  // --- officer ------------------------------------------------------------
  officerStats: () => api<OfficerStats>("/officer/stats"),
};
