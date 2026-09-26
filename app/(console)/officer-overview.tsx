"use client";

import {
  ArrowRightIcon,
  CircleCheckBigIcon,
  ClipboardListIcon,
  StarIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { ComplaintsTable } from "@/components/complaints/complaints-table";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton, TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssignedComplaints, useOfficerStats } from "@/hooks";
import { formatNumber } from "@/lib/format";
import { routes } from "@/routes";

/**
 * An officer sees their own queue rather than the city.
 *
 * `/officer/stats` is scoped to the signed-in officer server-side, and the
 * complaint list below comes from `/complaints/my-assigned` — so neither of them
 * can leak another department's work even if this page asked for it.
 */
export function OfficerOverview() {
  const stats = useOfficerStats();
  const queue = useAssignedComplaints({
    page: 1,
    limit: 8,
    sortBy: "slaDueAt",
    sortOrder: "asc",
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Your queue"
        description="The complaints assigned to you, soonest SLA deadline first."
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={routes.complaints.list} />}
          >
            All my complaints
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        }
      />

      {stats.isPending && <CardGridSkeleton count={4} />}

      {stats.isError && (
        <ErrorState error={stats.error} onRetry={() => void stats.refetch()} />
      )}

      {stats.data && (
        <div className="cc-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Open with you"
            value={formatNumber(stats.data.assigned)}
            hint="Anything not yet resolved or closed"
            icon={ClipboardListIcon}
            tone="primary"
          />
          <StatCard
            label="In progress"
            value={formatNumber(stats.data.inProgress)}
            hint="You have started work on these"
            icon={WrenchIcon}
            tone="warning"
          />
          <StatCard
            label="Resolved this month"
            value={formatNumber(stats.data.resolvedThisMonth)}
            hint="Resolved or closed since the 1st"
            icon={CircleCheckBigIcon}
            tone="success"
          />
          <StatCard
            label="SLA breaches"
            value={formatNumber(stats.data.slaBreaches)}
            hint="Escalated while assigned to you"
            icon={TriangleAlertIcon}
            tone={stats.data.slaBreaches ? "destructive" : "success"}
          />
        </div>
      )}

      {stats.data && stats.data.ratingCount > 0 && (
        <Card className="gap-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="space-y-0.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Citizen rating
              </p>
              <p className="flex items-baseline gap-1.5">
                <span className="font-heading text-2xl font-semibold">
                  {stats.data.avgRating?.toFixed(2) ?? "—"}
                </span>
                <span className="text-sm text-muted-foreground">out of 5</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                role="img"
                aria-label={`${stats.data.avgRating ?? 0} out of 5`}
                className="flex items-center gap-0.5"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <StarIcon
                    key={value}
                    aria-hidden
                    className={
                      value <= Math.round(stats.data.avgRating ?? 0)
                        ? "size-4 fill-warning text-warning"
                        : "size-4 text-muted-foreground/40"
                    }
                  />
                ))}
              </span>
              <span className="text-sm text-muted-foreground">
                from {formatNumber(stats.data.ratingCount)}{" "}
                {stats.data.ratingCount === 1 ? "rating" : "ratings"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="gap-0 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="h-card">Next up</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your eight most urgent by deadline. An overdue one is marked in red.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {queue.isPending && (
            <div className="p-4">
              <TableSkeleton rows={4} columns={5} />
            </div>
          )}

          {queue.isError && (
            <div className="p-4">
              <ErrorState
                error={queue.error}
                onRetry={() => void queue.refetch()}
              />
            </div>
          )}

          {queue.data && (
            <ComplaintsTable
              complaints={queue.data.items}
              emptyMessage="Nothing is assigned to you right now."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
