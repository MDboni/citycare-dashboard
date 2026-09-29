"use client";

import {
  BanIcon,
  CircleCheckIcon,
  Loader2Icon,
  LogOutIcon,
  SearchIcon,
  UserCogIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { RolePill, UserStatusPill } from "@/components/shared/status-pill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminUsers,
  useForceLogout,
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { ROLE_META, USER_STATUS_META } from "@/lib/constants";
import { formatDate, formatRelative, initials } from "@/lib/format";
import { useAuth } from "@/providers";
import { type AdminUser, ROLES, type Role, USER_STATUSES } from "@/types";

const DEFAULTS = { q: "", role: "all", status: "all", page: "1" };

export function UsersView() {
  const { user: me } = useAuth();
  const { values, setFilter, setPage, reset, isFiltered } =
    useFilterParams(DEFAULTS);

  const page = Number(values.page) || 1;
  const [search, setSearch] = useState(values.q);

  useEffect(() => setSearch(values.q), [values.q]);
  useEffect(() => {
    if (search === values.q) return;
    const timer = setTimeout(() => setFilter("q", search), 350);
    return () => clearTimeout(timer);
  }, [search, values.q, setFilter]);

  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useAdminUsers({
      page,
      limit: 15,
      ...(values.q ? { q: values.q } : {}),
      ...(values.role !== "all" ? { role: values.role as Role } : {}),
      ...(values.status !== "all"
        ? { status: values.status as "ACTIVE" | "BLOCKED" }
        : {}),
    });

  const users = data?.items ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Users"
        description="Everyone with a CityCare account. Changing a role or blocking an account revokes every session that user holds."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            aria-label="Search users"
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={values.role}
            onValueChange={(value) => setFilter("role", String(value ?? "all"))}
          >
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any role</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_META[role].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={values.status}
            onValueChange={(value) =>
              setFilter("status", String(value ?? "all"))
            }
          >
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              {USER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {USER_STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <XIcon />
              Clear
            </Button>
          )}
        </div>
      </div>

      {isPending && <TableSkeleton rows={6} columns={5} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && users.length === 0 && (
        <EmptyState
          icon={UsersIcon}
          title="Nobody matches that"
          description="Try a shorter search, or clear the role and status filters."
          action={
            isFiltered ? (
              <Button variant="outline" onClick={reset}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}

      {users.length > 0 && (
        <>
          <Card
            className={
              isPlaceholderData
                ? "overflow-hidden p-0 opacity-60 transition-opacity"
                : "overflow-hidden p-0"
            }
          >
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Person</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last seen</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {users.map((row) => (
                      <UserRow
                        key={row.id}
                        row={row}
                        isMe={row.id === me?.id}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <DataPagination
            meta={data?.meta}
            page={page}
            onPageChange={setPage}
            label="users"
          />
        </>
      )}
    </div>
  );
}

function UserRow({ row, isMe }: { row: AdminUser; isMe: boolean }) {
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();
  const forceLogout = useForceLogout();

  const [roleDialog, setRoleDialog] = useState(false);
  const [nextRole, setNextRole] = useState<Role>(row.role);
  const [blockDialog, setBlockDialog] = useState(false);
  const [reason, setReason] = useState("");

  const blocked = row.status === "BLOCKED";

  /**
   * A super admin row is deliberately read-only from here. The API refuses to
   * demote or block the last one, and `isSuperAdmin` is not settable through any
   * endpoint — so offering the controls would only produce a 403.
   */
  const locked = row.isSuperAdmin || isMe;

  const submitRole = async () => {
    if (nextRole === row.role) {
      setRoleDialog(false);
      return;
    }
    try {
      await updateRole.mutateAsync({ id: row.id, role: nextRole });
      toast.success(
        `${row.name} is now a ${ROLE_META[nextRole].label.toLowerCase()}.`,
      );
      setRoleDialog(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The role change failed.",
      );
    }
  };

  const submitStatus = async () => {
    const trimmed = reason.trim();
    try {
      await updateStatus.mutateAsync({
        id: row.id,
        status: blocked ? "ACTIVE" : "BLOCKED",
        ...(trimmed ? { reason: trimmed } : {}),
      });
      toast.success(
        blocked ? `${row.name} unblocked.` : `${row.name} blocked.`,
      );
      setBlockDialog(false);
      setReason("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The status change failed.",
      );
    }
  };

  return (
    <>
      <TableRow className={row.deletedAt ? "opacity-60" : undefined}>
        <TableCell>
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 shrink-0">
              {row.avatarUrl && <AvatarImage src={row.avatarUrl} alt="" />}
              <AvatarFallback className="text-[11px]">
                {initials(row.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-medium">
                <span className="truncate">{row.name}</span>
                {isMe && <Badge variant="secondary">You</Badge>}
                {row.isSuperAdmin && <Badge>Super admin</Badge>}
                {row.deletedAt && <Badge variant="outline">Deleted</Badge>}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {row.email}
                {row.twoFactorEnabled ? " · 2FA on" : ""}
              </p>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <RolePill role={row.role} />
        </TableCell>

        <TableCell>
          <UserStatusPill status={row.status} />
        </TableCell>

        <TableCell className="text-sm">
          {row.department?.name ?? (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>

        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
          {row.lastLoginAt ? formatRelative(row.lastLoginAt) : "Never"}
          <span className="block text-xs">
            Joined {formatDate(row.createdAt)}
          </span>
        </TableCell>

        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${row.name}`}
                />
              }
            >
              <UserCogIcon />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuHeader>{row.name}</DropdownMenuHeader>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={locked}
                onClick={() => {
                  setNextRole(row.role);
                  setRoleDialog(true);
                }}
              >
                <UserCogIcon />
                Change role
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={locked || forceLogout.isPending}
                onClick={async () => {
                  try {
                    const result = await forceLogout.mutateAsync(row.id);
                    toast.success(
                      `Signed out of ${result.revoked} ${result.revoked === 1 ? "session" : "sessions"}.`,
                    );
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Could not revoke the sessions.",
                    );
                  }
                }}
              >
                <LogOutIcon />
                Sign out everywhere
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant={blocked ? "default" : "destructive"}
                disabled={locked}
                onClick={() => setBlockDialog(true)}
              >
                {blocked ? <CircleCheckIcon /> : <BanIcon />}
                {blocked ? "Unblock account" : "Block account"}
              </DropdownMenuItem>

              {locked && (
                <>
                  <DropdownMenuSeparator />
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">
                    {isMe
                      ? "You cannot change your own role or status."
                      : "Super admin accounts are managed on the Staff page."}
                  </p>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <Dialog open={roleDialog} onOpenChange={setRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change role for {row.name}</DialogTitle>
            <DialogDescription>
              Every session this person holds is revoked, so they will have to
              sign in again with the new permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <FieldLabel htmlFor={`role-${row.id}`}>Role</FieldLabel>
            <Select
              value={nextRole}
              onValueChange={(value) => setNextRole(String(value) as Role)}
            >
              <SelectTrigger id={`role-${row.id}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_META[role].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              Promoting to officer without a department will leave them unable
              to see any complaints — set the department on the Staff page.
            </FieldDescription>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              disabled={updateRole.isPending}
              onClick={() => void submitRole()}
            >
              {updateRole.isPending && <Loader2Icon className="animate-spin" />}
              Change role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={blockDialog}
        onOpenChange={(open) => {
          setBlockDialog(open);
          if (!open) setReason("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {blocked ? `Unblock ${row.name}?` : `Block ${row.name}?`}
            </DialogTitle>
            <DialogDescription>
              {blocked
                ? "They will be able to sign in again immediately."
                : "They are signed out everywhere and every request they make is refused with a 403 until you unblock them."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <FieldLabel htmlFor={`reason-${row.id}`}>
              Reason (optional)
            </FieldLabel>
            <Textarea
              id={`reason-${row.id}`}
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Repeated abusive comments on complaint threads."
            />
            <FieldDescription>
              It goes in the audit log, not to the user.
            </FieldDescription>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              variant={blocked ? "default" : "destructive"}
              disabled={updateStatus.isPending}
              onClick={() => void submitStatus()}
            >
              {updateStatus.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              {blocked ? "Unblock" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
