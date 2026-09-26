"use client";

import { ScrollTextIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { RolePill } from "@/components/shared/status-pill";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { formatDateTime, humanise } from "@/lib/format";
import { useAuth } from "@/providers";
import type { AuditLog } from "@/types";

const DEFAULTS = { action: "", entityType: "", from: "", to: "", page: "1" };

/**
 * The audit trail.
 *
 * An ordinary admin sees only their own actions; a super admin sees everyone's.
 * That scoping is applied in the service from the caller's token, so the note
 * below is describing the API rather than promising anything this page enforces.
 */
export function AuditLogsView() {
  const { user } = useAuth();
  const { values, setFilter, setPage, reset, isFiltered } =
    useFilterParams(DEFAULTS);

  const page = Number(values.page) || 1;
  const [action, setAction] = useState(values.action);

  useEffect(() => setAction(values.action), [values.action]);
  useEffect(() => {
    if (action === values.action) return;
    const timer = setTimeout(() => setFilter("action", action), 350);
    return () => clearTimeout(timer);
  }, [action, values.action, setFilter]);

  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useAuditLogs({
      page,
      limit: 20,
      ...(values.action ? { action: values.action } : {}),
      ...(values.entityType ? { entityType: values.entityType } : {}),
      ...(values.from ? { from: values.from } : {}),
      ...(values.to ? { to: values.to } : {}),
    });

  const logs = data?.items ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Audit log"
        description="Every write this console makes, with who made it and what changed."
      />

      {!user?.isSuperAdmin && (
        <Alert>
          <AlertDescription>
            You are seeing your own actions. A super admin sees the whole trail.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="Filter by action, e.g. COMPLAINT_ASSIGNED"
            aria-label="Filter by action"
            className="pl-8 font-mono text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={values.from}
            onChange={(event) => setFilter("from", event.target.value)}
            aria-label="From date"
            className="w-[150px]"
          />
          <Input
            type="date"
            value={values.to}
            onChange={(event) => setFilter("to", event.target.value)}
            aria-label="To date"
            className="w-[150px]"
          />
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <XIcon />
              Clear
            </Button>
          )}
        </div>
      </div>

      {isPending && <TableSkeleton rows={8} columns={4} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && logs.length === 0 && (
        <EmptyState
          icon={ScrollTextIcon}
          title={
            isFiltered ? "Nothing matches those filters" : "The trail is empty"
          }
          description={
            isFiltered
              ? "Try a wider date range, or clear the action filter."
              : "Actions taken in this console will appear here as they happen."
          }
          action={
            isFiltered ? (
              <Button variant="outline" onClick={reset}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}

      {logs.length > 0 && (
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
                      <TableHead className="min-w-[180px]">When</TableHead>
                      <TableHead className="min-w-[200px]">Who</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead className="w-24" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {logs.map((log) => (
                      <AuditRow key={log.id} log={log} />
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
            label="entries"
          />
        </>
      )}
    </div>
  );
}

function AuditRow({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);
  const hasDiff = log.before != null || log.after != null;

  return (
    <>
      <TableRow>
        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
          {formatDateTime(log.createdAt)}
        </TableCell>

        <TableCell>
          {log.actor ? (
            <>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <span className="truncate">{log.actor.name}</span>
                <RolePill role={log.actor.role} />
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {log.actor.email}
              </p>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">System</span>
          )}
        </TableCell>

        <TableCell>
          <Badge variant="outline" className="font-mono text-[11px]">
            {log.action}
          </Badge>
        </TableCell>

        <TableCell className="text-sm">
          {humanise(log.entityType)}
          {log.entityId && (
            <span className="block font-mono text-[11px] text-muted-foreground">
              {log.entityId.slice(0, 8)}…
            </span>
          )}
        </TableCell>

        <TableCell>
          {hasDiff && (
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger render={<Button variant="ghost" size="xs" />}>
                {open ? "Hide" : "Changes"}
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </TableCell>
      </TableRow>

      {hasDiff && open && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/40">
            <div className="grid gap-3 py-1 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Before
                </p>
                <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-card p-2.5 font-mono text-[11px] whitespace-pre-wrap">
                  {log.before ? JSON.stringify(log.before, null, 2) : "—"}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  After
                </p>
                <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-card p-2.5 font-mono text-[11px] whitespace-pre-wrap">
                  {log.after ? JSON.stringify(log.after, null, 2) : "—"}
                </pre>
              </div>
            </div>

            {(log.ip || log.userAgent) && (
              <p className="pb-1 text-xs text-muted-foreground">
                {log.ip ? `From ${log.ip}` : ""}
                {log.ip && log.userAgent ? " · " : ""}
                {log.userAgent ?? ""}
              </p>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
