"use client";

import { BellIcon, LogOutIcon, UserCogIcon } from "lucide-react";
import Link from "next/link";
import { RolePill } from "@/components/shared/status-pill";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnreadCount } from "@/hooks";
import { initials } from "@/lib/format";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

export function ConsoleHeader() {
  const { user, isLoading, signOut } = useAuth();
  const { count } = useUnreadCount();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur supports-backdrop-filter:bg-background/65">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <div className="min-w-0 flex-1">
        {isLoading ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          user && (
            <p className="truncate text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">{user.name}</span>
              {user.department ? ` · ${user.department.name}` : ""}
            </p>
          )
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          nativeButton={false}
          render={
            <Link
              href={routes.notifications}
              aria-label={
                count ? `Notifications, ${count} unread` : "Notifications"
              }
            />
          }
        >
          <BellIcon />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-destructive-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  aria-label="Account menu"
                />
              }
            >
              <Avatar className="size-7">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                <AvatarFallback className="text-[11px]">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuHeader className="space-y-1.5 px-2 py-2 text-foreground">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </p>
                <span className="flex flex-wrap items-center gap-1.5">
                  <RolePill role={user.role} />
                  {user.isSuperAdmin && <Badge>Super admin</Badge>}
                </span>
              </DropdownMenuHeader>

              <DropdownMenuSeparator />

              <DropdownMenuItem render={<Link href={routes.account} />}>
                <UserCogIcon />
                Your account
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  void signOut();
                }}
              >
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
