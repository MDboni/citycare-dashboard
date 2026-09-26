"use client";

import {
  KeyRoundIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { PermissionsTab } from "@/components/access/permissions-tab";
import { RolesTab } from "@/components/access/roles-tab";
import { UserRolesTab } from "@/components/access/user-roles-tab";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermission } from "@/hooks";

/**
 * Access control, in the order the three ideas stack up: a permission is a
 * thing you may do, a role is a bundle of them, and a user holds roles. The
 * tabs read users → roles → permissions because that is the order someone
 * arrives with a question ("why can't Karim do X?").
 */
const TABS = [
  {
    value: "users",
    label: "Users",
    icon: UsersIcon,
    permission: "access_control__manage_users",
  },
  {
    value: "roles",
    label: "Roles",
    icon: ShieldCheckIcon,
    permission: "access_control__manage_roles",
  },
  {
    value: "permissions",
    label: "Permissions",
    icon: KeyRoundIcon,
    permission: "access_control__manage_permissions",
  },
] as const;

export function AccessView() {
  const { can, isLoading, isSuperAdmin } = usePermission();
  const [selected, setSelected] = useState<string | null>(null);

  /**
   * Nothing renders until the permission query settles.
   *
   * The tab strip is built out of what this viewer may use, and `can()` answers
   * false while it is still loading — so mounting early would show one set of
   * tabs and then swap it, which is exactly what Base UI warns about when an
   * uncontrolled default changes underneath it.
   */
  if (isLoading) return <CardGridSkeleton count={2} />;

  const allowed = TABS.filter((tab) => can(tab.permission));

  if (allowed.length === 0) {
    return (
      <EmptyState
        icon={ShieldXIcon}
        title="You do not have access to this screen"
        description="Managing roles and permissions needs one of the access control permissions. Ask a super admin."
      />
    );
  }

  // Controlled, and never pointed at a tab this viewer cannot see — a stale
  // selection after a permission change would otherwise render a blank panel.
  const active =
    selected && allowed.some((tab) => tab.value === selected)
      ? selected
      : allowed[0].value;

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
        value={active}
        onValueChange={(value) => setSelected(String(value))}
      >
        <TabsList>
          {allowed.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <tab.icon data-icon="inline-start" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {allowed.some((tab) => tab.value === "users") && (
          <TabsContent value="users" className="mt-4">
            <UserRolesTab />
          </TabsContent>
        )}

        {allowed.some((tab) => tab.value === "roles") && (
          <TabsContent value="roles" className="mt-4">
            <RolesTab
              canEdit={isSuperAdmin || can("access_control__manage_roles")}
            />
          </TabsContent>
        )}

        {allowed.some((tab) => tab.value === "permissions") && (
          <TabsContent value="permissions" className="mt-4">
            <PermissionsTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
