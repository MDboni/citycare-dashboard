"use client";

import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * The frame all five taxonomy lists share: a create form on the left, the list on
 * the right, and an edit dialog per row. Each list supplies its own columns and
 * its own form; nothing about departments or wards leaks into this file.
 *
 * `onDelete` is optional because not every taxonomy has one. Wards and zones have
 * no delete endpoint — the API deliberately refuses to remove a location that
 * complaints are already filed against — so those lists simply pass nothing.
 */
export type CrudColumn<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function CrudShell<T extends { id: string }>({
  title,
  description,
  rows,
  columns,
  isPending,
  isError,
  error,
  onRetry,
  createForm,
  editForm,
  onDelete,
  deleteWarning,
  emptyMessage,
  rowLabel,
}: {
  title: string;
  description: string;
  rows: T[];
  columns: CrudColumn<T>[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  createForm: ReactNode;
  editForm?: (row: T, close: () => void) => ReactNode;
  onDelete?: (row: T) => Promise<void>;
  deleteWarning?: string;
  emptyMessage: string;
  rowLabel: (row: T) => string;
}) {
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr] xl:items-start">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="h-card">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>{createForm}</CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden">
        <CardContent className="p-0">
          {isPending && (
            <div className="p-4">
              <TableSkeleton rows={5} columns={columns.length} />
            </div>
          )}

          {isError && (
            <div className="p-4">
              <ErrorState error={error} onRetry={onRetry} />
            </div>
          )}

          {!isPending && !isError && rows.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.header}
                        className={column.className}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                    {(editForm || onDelete) && <TableHead className="w-20" />}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((column) => (
                        <TableCell
                          key={column.header}
                          className={column.className}
                        >
                          {column.cell(row)}
                        </TableCell>
                      ))}

                      {(editForm || onDelete) && (
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {editForm && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Edit ${rowLabel(row)}`}
                                onClick={() => setEditing(row)}
                              >
                                <PencilIcon />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Delete ${rowLabel(row)}`}
                                onClick={() => setDeleting(row)}
                              >
                                <Trash2Icon />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editForm && (
        <Dialog
          open={editing !== null}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? `Edit ${rowLabel(editing)}` : "Edit"}
              </DialogTitle>
            </DialogHeader>
            {editing && editForm(editing, () => setEditing(null))}
          </DialogContent>
        </Dialog>
      )}

      {onDelete && (
        <Dialog
          open={deleting !== null}
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Delete {deleting ? rowLabel(deleting) : ""}?
              </DialogTitle>
              <DialogDescription>
                {deleteWarning ??
                  "This is a soft delete: the row stops appearing in the lists, and a super admin can restore it."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={async () => {
                  if (!deleting) return;
                  setIsDeleting(true);
                  try {
                    await onDelete(deleting);
                    setDeleting(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting && <Loader2Icon className="animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/** The submit row every taxonomy create form ends with. */
export function CreateSubmit({
  isSubmitting,
  label,
}: {
  isSubmitting: boolean;
  label: string;
}) {
  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <PlusIcon data-icon="inline-start" />
      )}
      {label}
    </Button>
  );
}
