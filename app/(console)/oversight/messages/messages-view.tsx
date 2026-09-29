"use client";

import { InboxIcon, Loader2Icon, MailIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
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
import { FieldLabel } from "@/components/ui/field";
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
import { useContactMessages, useUpdateContactMessage } from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { toApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import type { ContactMessage, ContactMessageStatus } from "@/types";

const DEFAULTS = { status: "", q: "", page: "1" };

const STATUSES: { value: ContactMessageStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "SPAM", label: "Spam" },
];

/** Status colours are the only place these four appear, so they live here. */
const TONE: Record<ContactMessageStatus, string> = {
  NEW: "bg-primary/10 text-primary",
  IN_PROGRESS: "bg-chart-2/15 text-chart-2",
  RESOLVED: "bg-success/10 text-success",
  SPAM: "bg-muted text-muted-foreground",
};

function StatusPill({ status }: { status: ContactMessageStatus }) {
  const label = STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${TONE[status]}`}
    >
      {label}
    </span>
  );
}

/**
 * The public contact form's inbox.
 *
 * These are not complaints and the screen does not pretend otherwise — there is
 * no SLA column and no assignment, because a message carries neither. All an
 * admin can do is read it, record what they did and move it along, which is the
 * whole of what the API offers.
 */
export function MessagesView() {
  const { values, setFilter, setPage, reset, isFiltered } =
    useFilterParams(DEFAULTS);

  const page = Number(values.page) || 1;

  // The search box is debounced into the URL rather than written per keystroke.
  const [search, setSearch] = useState(values.q);
  useEffect(() => setSearch(values.q), [values.q]);
  useEffect(() => {
    if (search === values.q) return;
    const timer = setTimeout(() => setFilter("q", search), 350);
    return () => clearTimeout(timer);
  }, [search, values.q, setFilter]);

  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useContactMessages({
      page,
      limit: 20,
      ...(values.status
        ? { status: values.status as ContactMessageStatus }
        : {}),
      ...(values.q ? { q: values.q } : {}),
    });

  const [open, setOpen] = useState<ContactMessage | null>(null);
  const items = data?.items ?? [];
  const newCount = Number(data?.meta.newCount ?? 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Messages"
        description="What people sent through the public contact form. These are not complaints — they carry no ward, no category and no SLA clock."
        actions={newCount > 0 ? <Badge>{newCount} unread</Badge> : undefined}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <SearchIcon
            className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            className="pl-8"
            placeholder="Search name, email or subject"
            aria-label="Search messages"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Filter by status"
          value={values.status}
          onChange={(event) => setFilter("status", event.target.value)}
        >
          <option value="">Any status</option>
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear
          </Button>
        )}
      </div>

      {isPending && <TableSkeleton rows={8} columns={5} />}
      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && items.length === 0 && (
        <EmptyState
          icon={InboxIcon}
          title={isFiltered ? "Nothing matches that" : "No messages yet"}
          description={
            isFiltered
              ? "Try a different status or clear the search."
              : "Messages sent from the public contact page land here."
          }
        />
      )}

      {items.length > 0 && (
        <Card
          className={`overflow-hidden p-0 ${isPlaceholderData ? "opacity-60" : ""}`}
        >
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-44">Received</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <span className="block font-medium">{row.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {row.email}
                        {row.phone ? ` · ${row.phone}` : ""}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="block truncate">{row.subject}</span>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={row.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOpen(row)}
                        >
                          Open
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

      {items.length > 0 && (
        <DataPagination
          meta={data?.meta}
          page={page}
          onPageChange={setPage}
          label="messages"
        />
      )}

      <MessageDialog message={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function MessageDialog({
  message,
  onClose,
}: {
  message: ContactMessage | null;
  onClose: () => void;
}) {
  const update = useUpdateContactMessage();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<ContactMessageStatus>("NEW");

  // Re-seed the controls whenever a different message is opened.
  useEffect(() => {
    if (!message) return;
    setNote(message.note ?? "");
    setStatus(message.status);
  }, [message]);

  const save = async () => {
    if (!message) return;
    try {
      await update.mutateAsync({ id: message.id, status, note });
      toast.success("Message updated.");
      onClose();
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <Dialog open={Boolean(message)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{message?.subject}</DialogTitle>
          <DialogDescription>
            From {message?.name} · {message?.email}
            {message?.phone ? ` · ${message.phone}` : ""}
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div className="space-y-4">
            <p className="whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-4 text-sm">
              {message.message}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Received {formatDateTime(message.createdAt)}</span>
              {message.handledBy && message.handledAt && (
                <span>
                  · Picked up by {message.handledBy.name},{" "}
                  {formatDateTime(message.handledAt)}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                  aria-label={`Reply to ${message.name} by email`}
                />
              }
            >
              <MailIcon data-icon="inline-start" />
              Reply by email
            </Button>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="message-status">Status</FieldLabel>
              <select
                id="message-status"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ContactMessageStatus)
                }
              >
                {STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="message-note">Internal note</FieldLabel>
              <Textarea
                id="message-note"
                rows={3}
                placeholder="What was done about it. Never shown to the sender."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button disabled={update.isPending} onClick={() => void save()}>
            {update.isPending && <Loader2Icon className="animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
