"use client";

import {
  BanknoteIcon,
  DownloadIcon,
  Loader2Icon,
  SearchIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChartCard } from "@/components/charts/chart-card";
import { CountBarChart } from "@/components/charts/count-bar-chart";
import { MoneyTrendChart } from "@/components/charts/money-trend-chart";
import { CopyButton } from "@/components/shared/copy-button";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CardGridSkeleton, TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PaymentStatusPill } from "@/components/shared/status-pill";
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
import {
  useDownloadLedgerCsv,
  usePaymentLedger,
  usePaymentSummary,
  useServiceTypes,
} from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import {
  formatBdt,
  formatBdtShort,
  formatDateTime,
  formatNumber,
} from "@/lib/format";
import type { PaymentLedgerRow, PaymentStatus } from "@/types";
import { PAYMENT_STATUSES } from "@/types";

const DEFAULTS = {
  status: "all",
  serviceTypeId: "all",
  from: "",
  to: "",
  q: "",
  page: "1",
};

/**
 * The money page.
 *
 * It answers one question in three passes, narrowing as it goes: what has come
 * in (the cards), when and from which service (the charts), and which exact
 * transaction (the table). Everything below the cards obeys the filter bar;
 * the three figures in the cards marked "today", "this month" and "all time"
 * deliberately do not, because a date range that quietly rewrote a total
 * labelled "today" would make this page useless for the one thing it is for.
 */
export function PaymentsView() {
  const { values, setFilter, setPage, reset, isFiltered } =
    useFilterParams(DEFAULTS);
  const page = Number(values.page) || 1;

  const [search, setSearch] = useState(values.q);
  useEffect(() => setSearch(values.q), [values.q]);
  useEffect(() => {
    if (search === values.q) return;
    const timer = setTimeout(() => setFilter("q", search), 350);
    return () => clearTimeout(timer);
  }, [search, values.q, setFilter]);

  /** What the table, the charts and the export all agree to look at. */
  const filters = {
    ...(values.status !== "all"
      ? { status: values.status as PaymentStatus }
      : {}),
    ...(values.serviceTypeId !== "all"
      ? { serviceTypeId: values.serviceTypeId }
      : {}),
    ...(values.from ? { from: values.from } : {}),
    ...(values.to ? { to: values.to } : {}),
    // Two characters is the server's floor; sending one comes back 400.
    ...(values.q.length >= 2 ? { q: values.q } : {}),
  };

  const { status: _status, ...summaryFilters } = filters;

  const summary = usePaymentSummary(summaryFilters);
  const ledger = usePaymentLedger({ ...filters, page, limit: 20 });
  const serviceTypes = useServiceTypes();
  const csv = useDownloadLedgerCsv();

  const rows = ledger.data?.items ?? [];
  const books = summary.data;

  const exportCsv = async () => {
    try {
      const blob = await csv.mutateAsync(filters);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `citycare-payments-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded.");
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "The export failed.",
      );
    }
  };

  const byService = (books?.byServiceType ?? []).map((row) => ({
    label: row.serviceType,
    count: Number(row.amount),
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Payments"
        description="What the city has collected, what is still owed and what went back out. Card details are handled by SSLCommerz and never reach CityCare — these are its records of the settlements."
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
            Export CSV
          </Button>
        }
      />

      {summary.isPending && <CardGridSkeleton count={4} />}

      {summary.isError && (
        <ErrorState
          error={summary.error}
          onRetry={() => void summary.refetch()}
        />
      )}

      {books && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Collected today"
              value={formatBdt(books.today.amount)}
              icon={BanknoteIcon}
              tone="success"
              hint={`${formatNumber(books.today.count)} ${books.today.count === 1 ? "payment" : "payments"} since midnight UTC`}
            />
            <StatCard
              label="This month"
              value={formatBdt(books.month.amount)}
              icon={WalletIcon}
              tone="primary"
              hint={`All time ${formatBdt(books.allTime.amount)} across ${formatNumber(books.allTime.count)}`}
            />
            <StatCard
              label="Awaiting payment"
              value={formatBdt(books.totals.pending.amount)}
              tone="warning"
              hint={`${formatNumber(books.totals.pending.count)} started and never settled`}
            />
            <StatCard
              label="Refunded"
              value={formatBdt(books.totals.refunded.amount)}
              tone={
                Number(books.totals.refunded.amount) > 0
                  ? "destructive"
                  : "default"
              }
              hint={`Net held ${formatBdt(books.totals.net)}`}
            />
          </div>

          {/* The filtered totals, spelled out, because the four cards above are
              two different things — three of them ignore the filter bar. */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 p-4 text-sm">
              <Figure
                label={isFiltered ? "Collected (filtered)" : "Collected"}
                value={formatBdt(books.totals.collected.amount)}
                count={books.totals.collected.count}
              />
              <Figure
                label="Refunded"
                value={formatBdt(books.totals.refunded.amount)}
                count={books.totals.refunded.count}
              />
              <Figure
                label="Net"
                value={formatBdt(books.totals.net)}
                hint="Collected less refunds"
              />
              <Figure
                label="Failed or cancelled"
                value={formatNumber(
                  books.totals.failed.count + books.totals.cancelled.count,
                )}
                hint="Attempts, not money"
              />
            </CardContent>
          </Card>

          <Card className="gap-0">
            <CardContent className="space-y-1 p-4 pb-0">
              <p className="font-heading text-base font-medium">
                Collected per day
              </p>
              <p className="text-sm text-muted-foreground">
                {values.from || values.to
                  ? "Settled money inside the selected range."
                  : "Settled money over the last 30 days."}{" "}
                Quiet days are shown at zero rather than left out. The search
                box narrows the table below, not this.
              </p>
            </CardContent>
            <CardContent className="pt-3">
              {books.daily.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No money settled in this window.
                </p>
              ) : (
                <MoneyTrendChart data={books.daily} />
              )}
            </CardContent>
          </Card>

          <ChartCard
            title="Collected by service"
            description="Settled money only. A service with nothing paid against it is not listed."
            data={byService}
            valueLabel="Collected"
            formatValue={formatBdtShort}
          >
            <CountBarChart
              data={byService}
              label="Collected"
              formatValue={formatBdtShort}
              height={Math.max(180, byService.length * 44)}
            />
          </ChartCard>
        </>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Transaction id, reference, payer or email"
            aria-label="Search payments"
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={values.status}
            onValueChange={(value) =>
              setFilter("status", String(value ?? "all"))
            }
          >
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={values.serviceTypeId}
            onValueChange={(value) =>
              setFilter("serviceTypeId", String(value ?? "all"))
            }
          >
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any service</SelectItem>
              {(serviceTypes.data ?? []).map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

      {ledger.isPending && <TableSkeleton rows={8} columns={6} />}

      {ledger.isError && (
        <ErrorState
          error={ledger.error}
          onRetry={() => void ledger.refetch()}
        />
      )}

      {!ledger.isPending && !ledger.isError && rows.length === 0 && (
        <EmptyState
          icon={WalletIcon}
          title={
            isFiltered ? "Nothing matches those filters" : "No payments yet"
          }
          description={
            isFiltered
              ? "Try a wider date range, or clear the status filter."
              : "Once a citizen pays a service fee, every attempt lands here — settled or not."
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

      {rows.length > 0 && (
        <>
          <Card
            className={
              ledger.isPlaceholderData
                ? "overflow-hidden p-0 opacity-60 transition-opacity"
                : "overflow-hidden p-0"
            }
          >
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[190px]">
                        Transaction
                      </TableHead>
                      <TableHead className="min-w-[180px]">Payer</TableHead>
                      <TableHead className="min-w-[170px]">Service</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="min-w-[170px]">Settled</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {rows.map((row) => (
                      <LedgerRow key={row.id} row={row} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <DataPagination
            meta={ledger.data?.meta}
            page={page}
            onPageChange={setPage}
            label="payments"
          />
        </>
      )}
    </div>
  );
}

/** One figure in the filtered-totals strip. */
function Figure({
  label,
  value,
  count,
  hint,
}: {
  label: string;
  value: string;
  count?: number;
  hint?: string;
}) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-heading text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">
        {hint ??
          `${formatNumber(count ?? 0)} ${count === 1 ? "payment" : "payments"}`}
      </p>
    </div>
  );
}

function LedgerRow({ row }: { row: PaymentLedgerRow }) {
  return (
    <TableRow>
      <TableCell>
        <span className="flex items-center gap-1">
          <code className="font-mono text-xs">{row.transactionId}</code>
          <CopyButton value={row.transactionId} label="Transaction id copied" />
        </span>
        <span className="block text-xs text-muted-foreground">
          Started {formatDateTime(row.createdAt)}
        </span>
      </TableCell>

      <TableCell>
        <span className="block font-medium">{row.user.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {row.user.email}
        </span>
      </TableCell>

      <TableCell>
        <span className="block">{row.serviceRequest.serviceType.name}</span>
        <span className="block font-mono text-xs text-muted-foreground">
          {row.serviceRequest.referenceNo}
        </span>
      </TableCell>

      <TableCell className="text-right font-medium tabular-nums">
        {formatBdt(row.amount)}
      </TableCell>

      <TableCell>
        <span className="flex flex-wrap items-center gap-1.5">
          <PaymentStatusPill status={row.status} />
          {row.refund && (
            <Badge variant="outline" className="text-xs">
              Refund {row.refund.status.toLowerCase()}
            </Badge>
          )}
        </span>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {row.paidAt ? formatDateTime(row.paidAt) : "—"}
      </TableCell>
    </TableRow>
  );
}
