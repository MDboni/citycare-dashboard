import { api, apiRequest } from "@/lib/api-client";
import type {
  AccessRole,
  MyPermissions,
  Permission,
  UserAccessRoles,
} from "@/types";

/**
 * Access control. Everything here is behind `access_control__*`, except
 * `mine()` — a user has to be able to ask what they may do, or the console
 * cannot decide which menu items to render.
 */
export const rbacApi = {
  mine: () => api<MyPermissions>("/access/me/permissions"),

  permissions: {
    list: (query?: { category?: string; search?: string }) =>
      api<Permission[]>("/access/permissions", { query }),
    create: (body: {
      code: string;
      name: string;
      description?: string;
      category: string;
    }) => api<Permission>("/access/permissions", { method: "POST", body }),
    /** No `code`: a route guard points at it, so renaming one breaks the guard. */
    update: (
      id: string,
      body: { name?: string; description?: string; category?: string },
    ) =>
      api<Permission>(`/access/permissions/${id}`, { method: "PATCH", body }),
    remove: (id: string) =>
      apiRequest<unknown>(`/access/permissions/${id}`, { method: "DELETE" }),
  },

  roles: {
    list: () => api<AccessRole[]>("/access/roles"),
    create: (body: {
      name: string;
      description?: string;
      permissionIds: string[];
    }) => api<AccessRole>("/access/roles", { method: "POST", body }),
    update: (
      id: string,
      body: { name?: string; description?: string; permissionIds?: string[] },
    ) => api<AccessRole>(`/access/roles/${id}`, { method: "PATCH", body }),
    remove: (id: string) =>
      apiRequest<unknown>(`/access/roles/${id}`, { method: "DELETE" }),
  },

  users: {
    roles: (id: string) => api<UserAccessRoles>(`/access/users/${id}/roles`),
    /** The payload is the whole set, not a delta. */
    assign: (id: string, roleIds: string[]) =>
      api<UserAccessRoles>(`/access/users/${id}/roles`, {
        method: "PUT",
        body: { roleIds },
      }),
  },
};
