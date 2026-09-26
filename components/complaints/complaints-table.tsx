"use client";

import { cn } from "cn";
import { ArrowRightIcon, ClockIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import {
  ComplaintStatusPill,
  PriorityPill,
} from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelative, slaCountdown, truncate } from "@/lib/format";
import { routes } from "@/routes";
import type { ComplaintListItem } from "@/types";

/**
 * The complaint queue as a table.
 *
 * The citizen app shows the same rows as cards; staff work through dozens at a
 * time, so a scannable grid with the SLA clock in its own column earns its place
 * here. The tracking id stays monospaced because it gets read out loud.
 */
export function ComplaintsTable({
  complaints,
  emptyMessage = "No complaints match this view.",
  showWard = true,
  showOfficer = true,
}: {
  complaints: ComplaintListItem[];
  emptyMessage?: string;
  showWard?: boolean;
  showOfficer?: boolean;
}) {
  if (!complaints.length) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[240px]">Complaint</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Category</TableHead>
            {showWard && <TableHead>Ward</TableHead>}
            {showOfficer && <TableHead>Officer</TableHead>}
            <TableHead>SLA</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {complaints.map((complaint) => {
            const sla = slaCountdown(complaint.slaDueAt, complaint.resolvedAt);

            return (
              <TableRow key={complaint.id}>
                <TableCell>
                  <Link
                    href={routes.complaints.detail(complaint.id)}
                    className="group block rounded outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="block font-medium underline-offset-4 group-hover:underline">
                      {truncate(complaint.title, 64)}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {complaint.trackingId}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(complaint.createdAt)}
                      </span>
                      {complaint.isEscalated && (
                        <Badge variant="destructive" className="gap-1">
                          <TriangleAlertIcon aria-hidden />
                          Escalated
                        </Badge>
                      )}
                    </span>
                  </Link>
                </TableCell>

                <TableCell>
                  <ComplaintStatusPill status={complaint.status} />
                </TableCell>

                <TableCell>
                  <PriorityPill priority={complaint.priority} />
                </TableCell>

                <TableCell className="text-sm">
                  {complaint.category.name}
                </TableCell>

                {showWard && (
                  <TableCell className="text-sm whitespace-nowrap">
                    Ward {complaint.ward.number}
                  </TableCell>
                )}

                {showOfficer && (
                  <TableCell className="text-sm">
                    {complaint.officer?.name ?? (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                )}

                <TableCell>
                  {sla ? (
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs whitespace-nowrap",
                        sla.overdue
                          ? "font-medium text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      <ClockIcon className="size-3.5" aria-hidden />
                      {sla.label}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Open ${complaint.trackingId}`}
                    nativeButton={false}
                    render={
                      <Link href={routes.complaints.detail(complaint.id)} />
                    }
                  >
                    <ArrowRightIcon />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
