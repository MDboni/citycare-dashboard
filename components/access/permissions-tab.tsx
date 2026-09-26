"use client";

import {
  KeyRoundIcon,
  LockIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
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
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
  useCreatePermission,
  useDeletePermission,
  usePermissions,
  useUpdatePermission,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import type { Permission } from "@/types";

type Draft = {
  code: string;
  name: string;
  description: string;
  category: string;
};

const EMPTY: Draft = { code: "", name: "", description: "", category: "" };

export function PermissionsTab() {
  const { data, isPending, isError, error, refetch } = usePermissions();
  const create = useCreatePermission();
  const update = useUpdatePermission();
  const remove = useDeletePermission();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<Permission | null>(null);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<Permission | null>(null);

  if (isPending) return <TableSkeleton rows={6} columns={4} />;
  if (isError)
    return <ErrorState error={error} onRetry={() => void refetch()} />;

  const permissions = data ?? [];

  const openCreate = () => {
    setEditing(null);
    setDraft(EMPTY);
    setOpen(true);
  };

  const openEdit = (permission: Permission) => {
    setEditing(permission);
    setDraft({
      code: permission.code,
      name: permission.name,
      description: permission.description ?? "",
      category: permission.category,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          name: draft.name.trim(),
          description: draft.description.trim() || undefined,
          category: draft.category.trim(),
        });
        toast.success("Permission updated.");
      } else {
        await create.mutateAsync({
          code: draft.code.trim(),
          name: draft.name.trim(),
          description: draft.description.trim() || undefined,
          category: draft.category.trim(),
        });
        toast.success("Permission created.");
      }
      setOpen(false);
    } catch (caught) {
      toast.error(toApiError(caught).message);
    }
  };

  const destroy = async (permission: Permission) => {
    try {
      await remove.mutateAsync(permission.id);
      toast.success("Permission deleted.");
      setConfirming(null);
    } catch (caught) {
      toast.error(toApiError(caught).message);
    }
  };

  // Grouped so the table reads as the matrix it is, rather than 30 flat rows.
  const byCategory = permissions.reduce<Record<string, Permission[]>>(
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
          {permissions.length} permissions. Built-in ones are referenced by the
          API&apos;s own route guards, so they can be renamed but not deleted.
        </p>
        <Button size="sm" onClick={openCreate}>
          <PlusIcon data-icon="inline-start" />
          New permission
        </Button>
      </div>

      {permissions.length === 0 ? (
        <EmptyState
          icon={KeyRoundIcon}
          title="No permissions yet"
          description="Seed the API or add the first one by hand."
        />
      ) : (
        Object.entries(byCategory).map(([category, rows]) => (
          <Card key={category} className="overflow-hidden p-0">
            <CardContent className="p-0">
              <div className="border-b border-border px-4 py-2.5">
                <h3 className="h-card">{category}</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Roles</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <span className="flex items-center gap-2 font-medium">
                          {permission.name}
                          {permission.isSystem && (
                            <Badge variant="secondary" className="gap-1">
                              <LockIcon aria-hidden />
                              Built-in
                            </Badge>
                          )}
                        </span>
                        {permission.description && (
                          <span className="block text-xs text-muted-foreground">
                            {permission.description}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="font-mono text-xs">
                          {permission.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {permission._count.roles}
                      </TableCell>
                      <TableCell>
                        <span className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${permission.name}`}
                            onClick={() => openEdit(permission)}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${permission.name}`}
                            disabled={permission.isSystem}
                            onClick={() => setConfirming(permission)}
                          >
                            <Trash2Icon />
                          </Button>
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit permission" : "New permission"}
            </DialogTitle>
            <DialogDescription>
              A permission is a thing someone may do. Roles are built out of
              them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="permission-code">Code</FieldLabel>
              <Input
                id="permission-code"
                value={draft.code}
                disabled={Boolean(editing)}
                placeholder="complaints__assign"
                onChange={(event) =>
                  setDraft({ ...draft, code: event.target.value })
                }
              />
              <FieldDescription>
                {editing
                  ? "The code cannot change: route guards point at it."
                  : "Lower snake case. This is what a route guard will reference."}
              </FieldDescription>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="permission-name">Name</FieldLabel>
              <Input
                id="permission-name"
                value={draft.name}
                placeholder="Assign complaints"
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="permission-category">Category</FieldLabel>
              <Input
                id="permission-category"
                value={draft.category}
                placeholder="Complaints"
                onChange={(event) =>
                  setDraft({ ...draft, category: event.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="permission-description">
                Description
              </FieldLabel>
              <Textarea
                id="permission-description"
                rows={3}
                value={draft.description}
                placeholder="What holding this actually lets someone do."
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
              />
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
              {editing ? "Save changes" : "Create permission"}
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
            <DialogTitle>Delete this permission?</DialogTitle>
            <DialogDescription>
              {confirming?.name} will be removed from every role that carries
              it. This cannot be undone.
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
