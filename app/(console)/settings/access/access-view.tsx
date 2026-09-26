"use client";

import { KeyRoundIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { PermissionsTab } from "@/components/access/permissions-tab";
import { RolesTab } from "@/components/access/roles-tab";
import { UserRolesTab } from "@/components/access/user-roles-tab";
import { PermissionGate } from "@/components/layout/permission-gate";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermission } from "@/hooks";

/**
 * Access control, in the order the three ideas actually stack up: a permission
 * is a thing you may do, a role is a bundle of them, and a user holds roles.
 * The tabs read left to right as users → roles → permissions because that is
 * the order someone arrives with a question ("why can't Karim do X?").
 */
export function AccessView() {
  const { can, isSuperAdmin } = usePermission();

  return (
    <div className="space-y-5">
      <Alert>
        <ShieldCheckIcon />
        <AlertTitle>These take effect within about a minute</AlertTitle>
        <AlertDescription>
          The API caches each user&apos;s permissions briefly. Staff who have
          never been given a role here fall back to the built-in role for their
          account type, so nobody loses access by being left alone. A super
          admin always passes every check — otherwise one bad save would lock
          everyone out of this screen.
        </AlertDescription>
      </Alert>

      <Tabs
        defaultValue={can("access_control__manage_users") ? "users" : "roles"}
      >
        <TabsList>
          <PermissionGate
            permission="access_control__manage_users"
            fallback={null}
          >
            <TabsTrigger value="users">
              <UsersIcon data-icon="inline-start" />
              Users
            </TabsTrigger>
          </PermissionGate>
          <PermissionGate
            permission="access_control__manage_roles"
            fallback={null}
          >
            <TabsTrigger value="roles">
              <ShieldCheckIcon data-icon="inline-start" />
              Roles
            </TabsTrigger>
          </PermissionGate>
          <PermissionGate
            permission="access_control__manage_permissions"
            fallback={null}
          >
            <TabsTrigger value="permissions">
              <KeyRoundIcon data-icon="inline-start" />
              Permissions
            </TabsTrigger>
          </PermissionGate>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <PermissionGate permission="access_control__manage_users">
            <UserRolesTab />
          </PermissionGate>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <PermissionGate permission="access_control__manage_roles">
            <RolesTab
              canEdit={isSuperAdmin || can("access_control__manage_roles")}
            />
          </PermissionGate>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <PermissionGate permission="access_control__manage_permissions">
            <PermissionsTab />
          </PermissionGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
