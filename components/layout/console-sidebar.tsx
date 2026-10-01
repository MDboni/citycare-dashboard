"use client";

import {
  BanknoteIcon,
  BuildingIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileTextIcon,
  GaugeIcon,
  InboxIcon,
  LayersIcon,
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
  /**
   * Other permissions that also open the link. It used to be one hardcoded pair
   * applied to every gated item, which was right for Access and wrong for
   * anything else: whoever can hand out roles would have been shown a Payments
   * link that answers 403.
   */
  orPermission?: string[];
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
    label: "Money",
    items: [
      {
        href: routes.payments.ledger,
        label: "Payments",
        icon: BanknoteIcon,
        roles: ["ADMIN"],
        // An admin can have this taken off them; the API refuses either way.
        permission: "payments__view_all",
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
        href: routes.oversight.messages,
        label: "Messages",
        icon: InboxIcon,
        roles: ["ADMIN"],
        permission: "contact__manage_messages",
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
        orPermission: [
          "access_control__manage_roles",
          "access_control__manage_permissions",
        ],
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
  const { user } = useAuth();

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
                          ...(item.orPermission ?? []),
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

        {/* Who is signed in, and nothing else. "Your account" and "Sign out"
            used to sit here as well, which put every one of them twice on the
            screen: the header's avatar menu already carries both, along with
            this same name and email. Two of everything made the nav list read
            as longer than it is, and the duplicate was the half nobody had
            asked for. */}
        {user && (
          <div className="min-w-0 px-2 py-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
