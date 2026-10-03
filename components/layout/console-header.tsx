"use client";

import {
  BellIcon,
  LogOutIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  UserCogIcon,
} from "lucide-react";
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
import { getAccessToken } from "@/lib/session";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

export function ConsoleHeader() {
  const { user, isLoading, signOut, refresh } = useAuth();
  const { count } = useUnreadCount();

  /**
   * A session we hold but cannot describe.
   *
   * `/users/me` is what fills this bar, and when it fails — the API unreachable,
   * a cold start timing out — `user` stays null. Hiding the account menu in that
   * case took away the only Sign out on the screen and left a console that
   * looked empty with no way to act on it. So the menu is rendered whenever
   * there is a session at all, and says plainly which of the two states it is in.
   */
  const stranded = !isLoading && !user && Boolean(getAccessToken());

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur supports-backdrop-filter:bg-background/65">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <div className="min-w-0 flex-1">
        {isLoading ? (
          <Skeleton className="h-4 w-40" />
        ) : user ? (
          <p className="truncate text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.name}</span>
            {user.department ? ` · ${user.department.name}` : ""}
          </p>
        ) : (
          stranded && (
            <p className="flex min-w-0 items-center gap-1.5 truncate text-sm text-muted-foreground">
              <TriangleAlertIcon className="size-4 shrink-0 text-destructive" />
              Could not reach CityCare. Your session is still signed in.
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

        {(user || stranded) && (
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
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                <AvatarFallback className="text-[11px]">
                  {user ? initials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              {user ? (
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
              ) : (
                <DropdownMenuHeader className="space-y-1 px-2 py-2 text-foreground">
                  <p className="text-sm font-medium">Signed in</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    Your profile could not be loaded. Try again, or sign out and
                    back in.
                  </p>
                </DropdownMenuHeader>
              )}

              <DropdownMenuSeparator />

              {user ? (
                <DropdownMenuItem render={<Link href={routes.account} />}>
                  <UserCogIcon />
                  Your account
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    void refresh();
                  }}
                >
                  <RefreshCwIcon />
                  Try again
                </DropdownMenuItem>
              )}

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
