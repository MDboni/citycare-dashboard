"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AdminUserFilters,
  type AuditLogFilters,
  adminApi,
  type SecurityEventFilters,
} from "@/api-client";
import type { Role, SettingKey, UserStatus } from "@/types";
import { adminKeys } from "./query-keys";

export const useDashboardStats = () =>
  useQuery({
    queryKey: adminKeys.dashboardStats,
    queryFn: adminApi.dashboardStats,
    // The endpoint is cached server-side for a short window; matching that here
    // stops a tab switch from re-fetching numbers that cannot have moved.
    staleTime: 60 * 1000,
  });

export const useOfficerStats = () =>
  useQuery({
    queryKey: adminKeys.officerStats,
    queryFn: adminApi.officerStats,
    staleTime: 60 * 1000,
  });

export const useAdminUsers = (filters: AdminUserFilters = {}) =>
  useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => adminApi.users(filters),
    placeholderData: (previous) => previous,
  });

/** Anything that changes a user invalidates every filtered user list. */
const useUserMutation = <TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminKeys.allUsers }),
  });
};

export const useCreateOfficer = () => useUserMutation(adminApi.createOfficer);

export const useCreateAdmin = () => useUserMutation(adminApi.createAdmin);

export const useUpdateUserRole = () =>
  useUserMutation(({ id, role }: { id: string; role: Role }) =>
    adminApi.updateRole(id, { role }),
  );

export const useUpdateUserStatus = () =>
  useUserMutation(
    ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: UserStatus;
      reason?: string;
    }) => adminApi.updateStatus(id, { status, ...(reason ? { reason } : {}) }),
  );

export const useForceLogout = () => useUserMutation(adminApi.forceLogout);

export const useRemoveAdmin = () => useUserMutation(adminApi.removeAdmin);

export const useAuditLogs = (filters: AuditLogFilters = {}) =>
  useQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: () => adminApi.auditLogs(filters),
    placeholderData: (previous) => previous,
  });

export const useSecurityEvents = (filters: SecurityEventFilters = {}) =>
  useQuery({
    queryKey: adminKeys.securityEvents(filters),
    queryFn: () => adminApi.securityEvents(filters),
    placeholderData: (previous) => previous,
  });

export const useSlaReport = () =>
  useQuery({ queryKey: adminKeys.slaReport, queryFn: adminApi.slaReport });

export const useSystemSettings = () =>
  useQuery({ queryKey: adminKeys.settings, queryFn: adminApi.settings });

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: SettingKey; value: number }) =>
      adminApi.updateSetting(key, value),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminKeys.settings }),
  });
};

export const useDownloadComplaintsCsv = () =>
  useMutation({ mutationFn: adminApi.downloadComplaintsCsv });
