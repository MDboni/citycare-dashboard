"use client";

import { ArrowRightIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { ServiceRequestStatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useServiceRequests } from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { SERVICE_REQUEST_STATUS_META } from "@/lib/constants";
import { formatBdt, formatDate } from "@/lib/format";
import { routes } from "@/routes";
import { SERVICE_REQUEST_STATUSES, type ServiceRequestStatus } from "@/types";

const DEFAULTS = { status: "all", page: "1" };

export function ServiceRequestsView() {
  const { values, setFilter, setPage, isFiltered, reset } =
    useFilterParams(DEFAULTS);

  const page = Number(values.page) || 1;
  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useServiceRequests({
      page,
      limit: 15,
      ...(values.status !== "all"
        ? { status: values.status as ServiceRequestStatus }
        : {}),
    });

  const requests = data?.items ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Service requests"
        description="Licence, certificate and permit applications. A request cannot be processed until its fee has settled."
      />

      <div className="flex items-center gap-2">
        <Select
          value={values.status}
          onValueChange={(value) => setFilter("status", String(value ?? "all"))}
        >
          <SelectTrigger size="sm" className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            {SERVICE_REQUEST_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {SERVICE_REQUEST_STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear
          </Button>
        )}
      </div>

      {isPending && <TableSkeleton rows={6} columns={5} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && requests.length === 0 && (
        <EmptyState
          icon={FileTextIcon}
          title={
            isFiltered ? "Nothing with that status" : "No applications yet"
          }
          description={
            isFiltered
              ? "Try a different status, or clear the filter."
              : "Once a citizen applies for a service it will appear here."
          }
          action={
            isFiltered ? (
              <Button variant="outline" onClick={reset}>
                Clear filter
              </Button>
            ) : undefined
          }
        />
      )}

      {requests.length > 0 && (
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
                      <TableHead>Service</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.serviceType.name}
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          {request.referenceNo}
                        </TableCell>

                        <TableCell className="text-sm">
                          {request.citizen ? (
                            <>
                              {request.citizen.name}
                              <span className="block text-xs text-muted-foreground">
                                {request.citizen.email}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right tabular-nums">
                          {formatBdt(request.serviceType.fee)}
                        </TableCell>

                        <TableCell>
                          <ServiceRequestStatusPill status={request.status} />
                        </TableCell>

                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                          {formatDate(request.createdAt)}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Open ${request.referenceNo}`}
                            nativeButton={false}
                            render={
                              <Link
                                href={routes.serviceRequests.detail(request.id)}
                              />
                            }
                          >
                            <ArrowRightIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
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
            label="applications"
          />
        </>
      )}
    </div>
  );
}
