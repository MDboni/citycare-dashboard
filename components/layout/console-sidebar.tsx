"use client";

import {
  BuildingIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileTextIcon,
  GaugeIcon,
  LayersIcon,
  MapIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
  SlidersHorizontalIcon,
  TagIcon,
  TrendingUpIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      {
        href: routes.oversight.settings,
        label: "Settings",
        icon: SlidersHorizontalIcon,
        roles: ["ADMIN"],
        superAdminOnly: true,
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
                  {items.map((item) => (
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
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
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
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
