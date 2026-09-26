import type { Role } from "./enums.types";

/**
 * Access control. These shapes are the API's, read off `/access/*` rather than
 * guessed: a permission row carries a `_count.roles` the list view needs, and a
 * role carries its permissions already flattened out of the join table.
 */

export type Permission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  /** Seeded and referenced by a route guard, so the API refuses to delete it. */
  isSystem: boolean;
  _count: { roles: number };
};

/** The trimmed permission embedded in a role. */
export type RolePermissionRef = {
  id: string;
  code: string;
  name: string;
};

export type AccessRole = {
  id: string;
  name: string;
  description: string | null;
  /** System roles cannot be renamed or deleted; their permissions can change. */
  isSystem: boolean;
  /** Set on the three seeded roles — the fallback for that account type. */
  mirrors: Role | null;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermissionRef[];
  _count: { users: number };
};

export type UserAccessRoles = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isSuperAdmin: boolean;
  roleIds: string[];
  /** True while this user still inherits from the system role for their type. */
  usingFallback: boolean;
};

/** `GET /access/me/permissions` — what the console uses to decide what to show. */
export type MyPermissions = {
  codes: string[];
  isSuperAdmin: boolean;
};
