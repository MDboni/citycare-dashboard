"use client";

import { cn } from "cn";
import { DownloadIcon, Loader2Icon, TrendingUpIcon } from "lucide-react";
import { toast } from "sonner";
import { ChartCard } from "@/components/charts/chart-card";
import { CountBarChart } from "@/components/charts/count-bar-chart";
import { AdminOnly } from "@/components/layout/role-gate";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton, TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDownloadComplaintsCsv, useSlaReport } from "@/hooks";
import { formatHours, formatNumber } from "@/lib/format";

export default function SlaReportPage() {
  return (
    <AdminOnly>
      <SlaReportView />
    </AdminOnly>
  );
}

function SlaReportView() {
  const { data, isPending, isError, error, refetch } = useSlaReport();
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

  const rows = data ?? [];
  const withWork = rows.filter((row) => row.total > 0);

  const totals = withWork.reduce(
    (acc, row) => ({
      total: acc.total + row.total,
      breached: acc.breached + row.breached,
    }),
    { total: 0, breached: 0 },
  );

  const overallBreach = totals.total
    ? (totals.breached / totals.total) * 100
    : 0;

  const ratedRows = withWork.filter((row) => row.avgRating !== null);
  const avgRating = ratedRows.length
    ? ratedRows.reduce((sum, row) => sum + (row.avgRating ?? 0), 0) /
      ratedRows.length
    : null;

  const breachChart = withWork.map((row) => ({
    label: row.department,
    count: row.breached,
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="SLA report"
        description="Per department: how much work came in, how much of it breached its deadline, and what citizens thought of the result."
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

      {isPending && (
        <>
          <CardGridSkeleton count={3} />
          <TableSkeleton rows={5} columns={5} />
        </>
      )}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && withWork.length === 0 && (
        <EmptyState
          icon={TrendingUpIcon}
          title="Nothing to report yet"
          description="Once complaints start being filed against a department, its SLA performance will show up here."
        />
      )}

      {withWork.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Complaints in scope"
              value={formatNumber(totals.total)}
              hint={`Across ${withWork.length} ${withWork.length === 1 ? "department" : "departments"}`}
              tone="default"
            />
            <StatCard
              label="Breach rate"
              value={`${overallBreach.toFixed(1)}%`}
              hint={`${formatNumber(totals.breached)} escalated past their SLA`}
              tone={overallBreach > 10 ? "destructive" : "success"}
            />
            <StatCard
              label="Average rating"
              value={avgRating ? avgRating.toFixed(2) : "—"}
              hint={
                avgRating
                  ? "Mean of the departments that have ratings"
                  : "No citizen has rated a fix yet"
              }
              tone="default"
            />
          </div>

          <ChartCard
            title="Breaches by department"
            description="Counts, not rates — the table below carries the percentage."
            data={breachChart}
            valueLabel="Breaches"
          >
            <CountBarChart
              data={breachChart}
              label="Breaches"
              height={Math.max(180, breachChart.length * 44)}
            />
          </ChartCard>

          <Card className="gap-0 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="h-card">By department</CardTitle>
              <p className="text-sm text-muted-foreground">
                A department with no complaints is left out of the summary above
                but still listed here.
              </p>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Complaints</TableHead>
                      <TableHead className="text-right">Breached</TableHead>
                      <TableHead className="text-right">Breach rate</TableHead>
                      <TableHead className="text-right">
                        Avg resolution
                      </TableHead>
                      <TableHead className="text-right">Avg rating</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.department}>
                        <TableCell className="font-medium">
                          {row.department}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(row.total)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(row.breached)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right tabular-nums",
                            row.breachPercent > 10 &&
                              "font-medium text-destructive",
                          )}
                        >
                          {row.total ? `${row.breachPercent}%` : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatHours(row.avgResolutionHours)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.avgRating?.toFixed(2) ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
