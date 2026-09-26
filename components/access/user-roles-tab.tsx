"use client";

import { SearchIcon, ShieldIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { RolePill } from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminUsers,
  useAssignUserRoles,
  useRoles,
  useUserRoles,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import type { AdminUser } from "@/types";

/**
 * Only staff appear here. A citizen has no console permissions to hold, and
 * listing 5,000 of them would bury the handful of accounts this screen is for.
 */
export function UserRolesTab() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const roles = useRoles();
  const assign = useAssignUserRoles();
  const { data, isPending, isError, error, refetch } = useAdminUsers({
    page: 1,
    limit: 50,
    q: search || undefined,
  });
  const current = useUserRoles(editing?.id ?? null);

  const staff = (data?.items ?? []).filter((u) => u.role !== "CITIZEN");

  const openEditor = (user: AdminUser) => {
    setEditing(user);
    setSelected(new Set());
  };

  // The dialog's checkboxes start from whatever the server says this user holds.
  if (
    editing &&
    current.data &&
    selected.size === 0 &&
    current.data.roleIds.length > 0
  ) {
    setSelected(new Set(current.data.roleIds));
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    if (!editing) return;
    try {
      await assign.mutateAsync({ id: editing.id, roleIds: [...selected] });
      toast.success("Roles updated.");
      setEditing(null);
    } catch (caught) {
      toast.error(toApiError(caught).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Give a staff member one or more roles. Leave someone with none and
          they keep the built-in access for their account type.
        </p>
        <div className="relative w-full sm:w-64">
          <SearchIcon
            className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="pl-8"
            placeholder="Search staff"
            value={search}
            aria-label="Search staff"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {isPending && <TableSkeleton rows={5} columns={4} />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && staff.length === 0 && (
        <EmptyState
          icon={UsersIcon}
          title="No staff found"
          description="Officers and admins appear here once they exist."
        />
      )}

      {staff.length > 0 && (
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff member</TableHead>
                  <TableHead>Account type</TableHead>
                  <TableHead>Access roles</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="block font-medium">{user.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <RolePill role={user.role} />
                        {user.isSuperAdmin && <Badge>Super admin</Badge>}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.isSuperAdmin ? "Everything, always" : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={user.isSuperAdmin}
                          onClick={() => openEditor(user)}
                        >
                          <ShieldIcon data-icon="inline-start" />
                          Roles
                        </Button>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(v) => !v && setEditing(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Roles for {editing?.name}</DialogTitle>
            <DialogDescription>
              {current.data?.usingFallback
                ? "This account has no explicit roles, so it currently inherits the built-in role for its account type."
                : "Saving replaces every role this account holds."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {(roles.data ?? []).map((role) => (
              <div
                key={role.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
              >
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selected.has(role.id)}
                  onCheckedChange={() => toggle(role.id)}
                />
                <label
                  htmlFor={`role-${role.id}`}
                  className="min-w-0 cursor-pointer"
                >
                  <span className="block text-sm font-medium">{role.name}</span>
                  {role.description && (
                    <span className="block text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  )}
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {role.permissions.length} permissions
                  </span>
                </label>
              </div>
            ))}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button disabled={assign.isPending} onClick={() => void save()}>
              Save roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
