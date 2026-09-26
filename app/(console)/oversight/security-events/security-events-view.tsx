"use client";

import { ShieldAlertIcon, XIcon } from "lucide-react";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useSecurityEvents } from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { formatDateTime, humanise } from "@/lib/format";
import { SECURITY_EVENT_TYPES, type SecurityEventType } from "@/types";

const DEFAULTS = { type: "all", ip: "", from: "", to: "", page: "1" };

/** The events worth a second look get a louder badge than the routine ones. */
const TONE: Partial<Record<SecurityEventType, "destructive" | "warning">> = {
  LOGIN_FAILED: "warning",
  OTP_FAILED: "warning",
  ACCOUNT_LOCKED: "destructive",
  TOKEN_REUSE: "destructive",
  NEW_DEVICE: "warning",
  ROLE_CHANGED: "warning",
};

export function SecurityEventsView() {
  const { values, setFilter, setPage, reset, isFiltered } =
    useFilterParams(DEFAULTS);

  const page = Number(values.page) || 1;
  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useSecurityEvents({
      page,
      limit: 25,
      ...(values.type !== "all"
        ? { type: values.type as SecurityEventType }
        : {}),
      ...(values.ip ? { ip: values.ip } : {}),
      ...(values.from ? { from: values.from } : {}),
      ...(values.to ? { to: values.to } : {}),
    });

  const events = data?.items ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Security events"
        description="Sign-ins, failures, lockouts, new devices and token reuse. A run of failures from one address is the thing to look for."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Select
          value={values.type}
          onValueChange={(value) => setFilter("type", String(value ?? "all"))}
        >
          <SelectTrigger size="sm" className="w-[200px]">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Every event</SelectItem>
            {SECURITY_EVENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {humanise(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={values.ip}
          onChange={(event) => setFilter("ip", event.target.value)}
          placeholder="Filter by IP"
          aria-label="Filter by IP address"
          className="w-full font-mono text-xs lg:w-[170px]"
        />

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

      {!isPending && !isError && events.length === 0 && (
        <EmptyState
          icon={ShieldAlertIcon}
          title={
            isFiltered ? "Nothing matches those filters" : "No events recorded"
          }
          description={
            isFiltered
              ? "Widen the date range, or clear the type and IP filters."
              : "Sign-in activity will appear here as it happens."
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

      {events.length > 0 && (
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
                      <TableHead className="min-w-[170px]">When</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="min-w-[200px]">Device</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {events.map((event) => {
                      const tone = TONE[event.type];
                      return (
                        <TableRow key={event.id}>
                          <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                            {formatDateTime(event.createdAt)}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                tone === "destructive"
                                  ? "destructive"
                                  : tone === "warning"
                                    ? "outline"
                                    : "secondary"
                              }
                              className={
                                tone === "warning" ? "text-warning" : undefined
                              }
                            >
                              {humanise(event.type)}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-sm">
                            {event.email ?? (
                              <span className="text-muted-foreground">
                                {event.userId
                                  ? `${event.userId.slice(0, 8)}…`
                                  : "Unknown"}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="font-mono text-xs">
                            {event.ip ?? "—"}
                          </TableCell>

                          <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">
                            {event.userAgent ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <DataPagination
            meta={data?.meta}
            page={page}
            onPageChange={setPage}
            label="events"
          />
        </>
      )}
    </div>
  );
}
