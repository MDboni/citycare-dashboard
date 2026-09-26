"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rbacApi } from "@/api";
import { queryKeys } from "./query-keys";

/**
 * What the signed-in staff member may do.
 *
 * Kept long-lived because it changes only when an administrator edits a role,
 * and every one of those writes invalidates this key. The server caches the
 * same answer for a minute, so a grant taken away elsewhere lands within one
 * refetch either way — and the API re-checks on every request regardless, so
 * a stale copy here can only ever hide a button, never open a door.
 */
export const useMyPermissions = () =>
  useQuery({
    queryKey: queryKeys.access.mine,
    queryFn: rbacApi.mine,
    staleTime: 5 * 60 * 1000,
  });

/**
 * `can("complaints__assign")` for conditional rendering.
 *
 * While the query is still loading this answers false, which is why callers
 * should lean on `isLoading` rather than flashing a refusal at someone who
 * turns out to be allowed.
 */
export const usePermission = () => {
  const { data, isLoading } = useMyPermissions();
  const codes = data?.codes;

  return {
    isLoading,
    isSuperAdmin: data?.isSuperAdmin ?? false,
    can: (...required: string[]) =>
      Boolean(data?.isSuperAdmin) ||
      required.some((code) => codes?.includes(code)),
  };
};

// ── permissions ─────────────────────────────────────────────────────────────

export const usePermissions = (params?: {
  category?: string;
  search?: string;
}) =>
  useQuery({
    queryKey: [...queryKeys.access.permissions, params ?? {}] as const,
    queryFn: () => rbacApi.permissions.list(params),
  });

/** Every access write sweeps the whole `access` tree: a role edit changes the
 *  permission row's usage count, and an assignment changes the role's. */
const useAccessMutation = <TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.access.all }),
  });
};

export const useCreatePermission = () =>
  useAccessMutation(rbacApi.permissions.create);

export const useUpdatePermission = () =>
  useAccessMutation(
    ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      description?: string;
      category?: string;
    }) => rbacApi.permissions.update(id, body),
  );

export const useDeletePermission = () =>
  useAccessMutation(rbacApi.permissions.remove);

// ── roles ───────────────────────────────────────────────────────────────────

export const useRoles = () =>
  useQuery({ queryKey: queryKeys.access.roles, queryFn: rbacApi.roles.list });

export const useCreateRole = () => useAccessMutation(rbacApi.roles.create);

export const useUpdateRole = () =>
  useAccessMutation(
    ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      description?: string;
      permissionIds?: string[];
    }) => rbacApi.roles.update(id, body),
  );

export const useDeleteRole = () => useAccessMutation(rbacApi.roles.remove);

// ── assignment ──────────────────────────────────────────────────────────────

export const useUserRoles = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.access.userRoles(id ?? ""),
    queryFn: () => rbacApi.users.roles(id as string),
    enabled: Boolean(id),
  });

export const useAssignUserRoles = () =>
  useAccessMutation(({ id, roleIds }: { id: string; roleIds: string[] }) =>
    rbacApi.users.assign(id, roleIds),
  );
