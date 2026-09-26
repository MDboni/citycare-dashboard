"use client";

import {
  ClipboardListIcon,
  ClockIcon,
  DownloadIcon,
  Loader2Icon,
  TriangleAlertIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ChartCard } from "@/components/charts/chart-card";
import { CountBarChart } from "@/components/charts/count-bar-chart";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useDownloadComplaintsCsv } from "@/hooks";
import { COMPLAINT_STATUS_META, PRIORITY_META } from "@/lib/constants";
import { formatBdt, formatHours, formatNumber } from "@/lib/format";
import { PRIORITIES } from "@/types";

/** The four ramp steps, lightest to darkest, for LOW through URGENT. */
const PRIORITY_RAMP = [
  "var(--ramp-1)",
  "var(--ramp-2)",
  "var(--ramp-3)",
  "var(--ramp-4)",
];

export function AdminOverview() {
  const { data, isPending, isError, error, refetch } = useDashboardStats();
  const csv = useDownloadComplaintsCsv();

  const exportCsv = async () => {
    try {
      const blob = await csv.mutateAsync({});
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `citycare-complaints-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded.");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "The export failed.",
      );
    }
  };

  if (isPending) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <CardGridSkeleton count={4} />
        <CardGridSkeleton count={2} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  const byStatus = data.byStatus.map((row) => ({
    label: COMPLAINT_STATUS_META[row.status].label,
    count: row.count,
  }));

  // Priority keeps its own order rather than being sorted by size: the ramp only
  // means something if LOW sits at one end and URGENT at the other.
  const byPriority = PRIORITIES.map((priority) => ({
    label: PRIORITY_META[priority].label,
    count: data.byPriority.find((row) => row.priority === priority)?.count ?? 0,
  }));

  const topCategories = data.topCategories.map((row) => ({
    label: row.category,
    count: row.count,
  }));

  const byWard = [...data.byWard]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((row) => ({ label: row.ward, count: row.count }));

  const breachRate = data.totals.complaints
    ? (data.totals.escalated / data.totals.complaints) * 100
    : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Overview"
        description="Where the city stands right now. Complaint counts are live; payment totals cover today and the month to date."
        actions={
          <Button
            variant="outline"
            disabled={csv.isPending}
            onClick={() => void exportCsv()}
          >
            {csv.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <DownloadIcon data-icon="inline-start" />
            )}
            Export complaints CSV
          </Button>
        }
      />

      <div className="cc-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open complaints"
          value={formatNumber(data.totals.open)}
          hint={`${formatNumber(data.totals.complaints)} reported all time`}
          icon={ClipboardListIcon}
          tone="primary"
        />
        <StatCard
          label="SLA breached"
          value={formatNumber(data.totals.escalated)}
          hint={`${breachRate.toFixed(1)}% of every complaint`}
          icon={TriangleAlertIcon}
          tone={data.totals.escalated ? "destructive" : "success"}
        />
        <StatCard
          label="Avg resolution"
          value={formatHours(data.avgResolutionHours)}
          hint="Across the last 30 days"
          icon={ClockIcon}
          tone="default"
        />
        <StatCard
          label="Registered users"
          value={formatNumber(data.totals.users)}
          hint="Citizens, officers and admins"
          icon={UsersIcon}
          tone="default"
        />
      </div>

      <div className="cc-stagger grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Fees collected today"
          value={formatBdt(data.payments.today.amount)}
          hint={`${formatNumber(data.payments.today.count)} successful payments`}
          icon={WalletIcon}
          tone="success"
        />
        <StatCard
          label="Fees collected this month"
          value={formatBdt(data.payments.month.amount)}
          hint={`${formatNumber(data.payments.month.count)} successful payments`}
          icon={WalletIcon}
          tone="success"
        />
      </div>

      <div className="cc-stagger grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Complaints by status"
          description="Every complaint on the books, by where it has got to."
          data={byStatus}
        >
          <CountBarChart data={byStatus} label="Complaints" height={300} />
        </ChartCard>

        <ChartCard
          title="Complaints by priority"
          description="Low through urgent. Ten upvotes moves a complaint up one step."
          data={byPriority}
        >
          <CountBarChart
            data={byPriority}
            label="Complaints"
            colors={PRIORITY_RAMP}
            height={220}
          />
        </ChartCard>

        <ChartCard
          title="Busiest categories"
          description="The five categories carrying the most complaints."
          data={topCategories}
        >
          <CountBarChart data={topCategories} label="Complaints" height={240} />
        </ChartCard>

        <ChartCard
          title="Busiest wards"
          description="The eight wards reporting the most. The rest are in the table view."
          data={byWard}
        >
          <CountBarChart data={byWard} label="Complaints" height={300} />
        </ChartCard>
      </div>
    </div>
  );
}
