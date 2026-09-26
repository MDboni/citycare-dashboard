"use client";

import {
  BuildingIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileTextIcon,
  GaugeIcon,
  LayersIcon,
  LogOutIcon,
  MapIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  TagIcon,
  TrendingUpIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PermissionGate } from "@/components/layout/permission-gate";
import { LogoMark } from "@/components/shared/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers";
import { routes } from "@/routes";
import type { Role } from "@/types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof GaugeIcon;
  /** Which roles see the link. Absent means every signed-in role. */
  roles?: Role[];
  superAdminOnly?: boolean;
  /**
   * Hide the link unless the viewer holds this permission. Only worth setting
   * where a role alone is not the answer — Access is reachable by any admin who
   * has been granted it, not only by a super admin.
   */
  permission?: string;
};

type NavGroup = { label: string; items: NavItem[] };

/**
 * The sidebar is filtered by role and by super-admin status, mirroring the
 * `authorize` and `superAdminOnly` guards on the API routes. Hiding a link is a
 * courtesy, not a control: the endpoint refuses the call either way.
 */
const GROUPS: NavGroup[] = [
  {
    label: "Work",
    items: [
      { href: routes.home, label: "Overview", icon: GaugeIcon },
      {
        href: routes.complaints.list,
        label: "Complaints",
        icon: ClipboardListIcon,
      },
      {
        href: routes.serviceRequests.list,
        label: "Service requests",
        icon: FileTextIcon,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        href: routes.people.users,
        label: "Users",
        icon: UsersIcon,
        roles: ["ADMIN"],
      },
      {
        href: routes.people.staff,
        label: "Staff",
        icon: UserCogIcon,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Taxonomy",
    items: [
      {
        href: routes.taxonomy.departments,
        label: "Departments",
        icon: BuildingIcon,
        roles: ["ADMIN"],
      },
      {
        href: routes.taxonomy.categories,
        label: "Categories",
        icon: TagIcon,
        roles: ["ADMIN"],
      },
      {
        href: routes.taxonomy.wards,
        label: "Wards",
        icon: MapIcon,
        roles: ["ADMIN"],
      },
      {
        href: routes.taxonomy.zones,
        label: "Zones",
        icon: LayersIcon,
        roles: ["ADMIN"],
      },
      {
        href: routes.taxonomy.serviceTypes,
        label: "Service types",
        icon: DatabaseIcon,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Oversight",
    items: [
      {
        href: routes.reports.sla,
        label: "SLA report",
        icon: TrendingUpIcon,
        roles: ["ADMIN"],
      },
      {
        href: routes.oversight.auditLogs,
        label: "Audit log",
        icon: ScrollTextIcon,
        roles: ["ADMIN"],
      },
      {
        href: routes.oversight.securityEvents,
        label: "Security events",
        icon: ShieldAlertIcon,
        roles: ["ADMIN"],
        superAdminOnly: true,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        href: routes.settings.system,
        label: "System",
        icon: SlidersHorizontalIcon,
        roles: ["ADMIN"],
        superAdminOnly: true,
      },
      {
        href: routes.settings.access,
        label: "Access",
        icon: ShieldCheckIcon,
        roles: ["ADMIN"],
        // Not superAdminOnly: an admin who has been GIVEN access_control__*
        // should reach it. The page hides the tabs they cannot use and the API
        // refuses regardless, so this only keeps a dead link out of the nav.
        permission: "access_control__manage_users",
      },
    ],
  },
];

const isActive = (pathname: string, href: string) =>
  href === routes.home
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

export function ConsoleSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const role = user?.role;
  const visible = (item: NavItem) => {
    if (item.roles && (!role || !item.roles.includes(role))) return false;
    if (item.superAdminOnly && !user?.isSuperAdmin) return false;
    return true;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="CityCare console"
              render={<Link href={routes.home} />}
            >
              <LogoMark className="size-8" />
              <span className="grid text-left leading-tight">
                <span className="font-heading text-sm font-semibold">
                  City<span className="text-primary">Care</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Staff console
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => {
          const items = group.items.filter(visible);
          if (!items.length) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const link = (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive(pathname, item.href)}
                          tooltip={item.label}
                          render={<Link href={item.href} />}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );

                    // fallback={null} so a nav item the viewer lacks simply is
                    // not there, rather than leaving a refusal card in the menu.
                    return item.permission ? (
                      <PermissionGate
                        key={item.href}
                        permission={[
                          item.permission,
                          "access_control__manage_roles",
                          "access_control__manage_permissions",
                        ]}
                        fallback={null}
                      >
                        {link}
                      </PermissionGate>
                    ) : (
                      link
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />

        {/* Who is signed in, spelled out. The header has an avatar menu too,
            but a sign-out worth finding should not be two clicks inside one. */}
        {user && (
          <div className="min-w-0 px-2 py-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === routes.account}
              tooltip="Your account"
              render={<Link href={routes.account} />}
            >
              <UserCogIcon />
              <span>Your account</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                void signOut();
              }}
            >
              <LogOutIcon />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
