"use client";

import {
  LockIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton } from "@/components/shared/loading";
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
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateRole,
  useDeleteRole,
  usePermissions,
  useRoles,
  useUpdateRole,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import type { AccessRole, Permission } from "@/types";

export function RolesTab({ canEdit }: { canEdit: boolean }) {
  const roles = useRoles();
  const permissions = usePermissions();
  const create = useCreateRole();
  const update = useUpdateRole();
  const remove = useDeleteRole();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AccessRole | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<AccessRole | null>(null);

  if (roles.isPending || permissions.isPending) return <CardGridSkeleton />;
  if (roles.isError)
    return (
      <ErrorState error={roles.error} onRetry={() => void roles.refetch()} />
    );

  const allPermissions = permissions.data ?? [];

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setSelected(new Set());
    setOpen(true);
  };

  const openEdit = (role: AccessRole) => {
    setEditing(role);
    setName(role.name);
    setDescription(role.description ?? "");
    setSelected(new Set(role.permissions.map((p) => p.id)));
    setOpen(true);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (rows: Permission[], on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const row of rows) {
        if (on) next.add(row.id);
        else next.delete(row.id);
      }
      return next;
    });
  };

  const save = async () => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          // A system role's name is fixed, so it is not sent back.
          name: editing.isSystem ? undefined : name.trim(),
          description: description.trim() || undefined,
          permissionIds: [...selected],
        });
        toast.success("Role updated.");
      } else {
        await create.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          permissionIds: [...selected],
        });
        toast.success("Role created.");
      }
      setOpen(false);
    } catch (caught) {
      toast.error(toApiError(caught).message);
    }
  };

  const destroy = async (role: AccessRole) => {
    try {
      await remove.mutateAsync(role.id);
      toast.success("Role deleted.");
      setConfirming(null);
    } catch (caught) {
      toast.error(toApiError(caught).message);
    }
  };

  const byCategory = allPermissions.reduce<Record<string, Permission[]>>(
    (acc, p) => {
      const bucket = acc[p.category] ?? [];
      bucket.push(p);
      acc[p.category] = bucket;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          A role is a bundle of permissions. Built-in roles are the fallback for
          each account type — their permissions can change, their names cannot.
        </p>
        {canEdit && (
          <Button size="sm" onClick={openCreate}>
            <PlusIcon data-icon="inline-start" />
            New role
          </Button>
        )}
      </div>

      {(roles.data ?? []).length === 0 ? (
        <EmptyState
          icon={ShieldCheckIcon}
          title="No roles yet"
          description="Create the first one."
        />
      ) : (
        <div className="cc-stagger grid gap-4 lg:grid-cols-2">
          {(roles.data ?? []).map((role) => (
            <Card key={role.id} className="cc-lift">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h3 className="h-card flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <Badge variant="secondary" className="gap-1">
                          <LockIcon aria-hidden />
                          Built-in
                        </Badge>
                      )}
                    </h3>
                    {role.description && (
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <span className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${role.name}`}
                        onClick={() => openEdit(role)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${role.name}`}
                        disabled={role.isSystem || role._count.users > 0}
                        onClick={() => setConfirming(role)}
                      >
                        <Trash2Icon />
                      </Button>
                    </span>
                  )}
                </div>

                <Separator />

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {role.permissions.length} permissions
                  </span>
                  <span aria-hidden>·</span>
                  <span>{role._count.users} directly assigned</span>
                  {role.mirrors && (
                    <>
                      <span aria-hidden>·</span>
                      <span>fallback for {role.mirrors}</span>
                    </>
                  )}
                </div>

                {role.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.slice(0, 6).map((p) => (
                      <Badge
                        key={p.id}
                        variant="outline"
                        className="font-normal"
                      >
                        {p.name}
                      </Badge>
                    ))}
                    {role.permissions.length > 6 && (
                      <Badge variant="outline" className="font-normal">
                        +{role.permissions.length - 6} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${editing.name}` : "New role"}
            </DialogTitle>
            <DialogDescription>
              Tick everything this role should be able to do. Saving replaces
              the role&apos;s whole permission set.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="role-name">Name</FieldLabel>
              <Input
                id="role-name"
                value={name}
                disabled={editing?.isSystem}
                placeholder="Complaints desk"
                onChange={(event) => setName(event.target.value)}
              />
              {editing?.isSystem && (
                <FieldDescription>
                  Built-in roles keep their name — staff with no explicit role
                  fall back to this one by that name.
                </FieldDescription>
              )}
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="role-description">Description</FieldLabel>
              <Textarea
                id="role-description"
                rows={2}
                value={description}
                placeholder="Who this is for, in one line."
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <p className="text-sm font-medium">
                Permissions
                <span className="ml-2 font-normal text-muted-foreground">
                  {selected.size} selected
                </span>
              </p>

              {Object.entries(byCategory).map(([category, rows]) => {
                const allOn = rows.every((r) => selected.has(r.id));
                return (
                  <fieldset
                    key={category}
                    className="space-y-2 rounded-lg border border-border p-3"
                  >
                    <legend className="flex items-center gap-2 px-1 text-xs font-semibold tracking-wide uppercase">
                      {category}
                    </legend>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        id={`select-all-${category}`}
                        checked={allOn}
                        onCheckedChange={(checked) =>
                          toggleCategory(rows, checked === true)
                        }
                      />
                      <label
                        htmlFor={`select-all-${category}`}
                        className="cursor-pointer"
                      >
                        Select all in {category}
                      </label>
                    </div>

                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {rows.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start gap-2 rounded-md p-1.5 text-sm hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={selected.has(permission.id)}
                            onCheckedChange={() => toggle(permission.id)}
                          />
                          <label
                            htmlFor={`perm-${permission.id}`}
                            className="min-w-0 cursor-pointer"
                          >
                            <span className="block leading-tight">
                              {permission.name}
                            </span>
                            <code className="block font-mono text-[11px] text-muted-foreground">
                              {permission.code}
                            </code>
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              disabled={create.isPending || update.isPending}
              onClick={() => void save()}
            >
              {editing ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(confirming)}
        onOpenChange={(v) => !v && setConfirming(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this role?</DialogTitle>
            <DialogDescription>
              {confirming?.name} will be removed. Anyone holding it falls back
              to the built-in role for their account type.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => confirming && void destroy(confirming)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
