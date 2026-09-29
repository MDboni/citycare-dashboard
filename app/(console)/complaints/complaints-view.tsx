"use client";

import { ClipboardListIcon } from "lucide-react";
import {
  COMPLAINT_FILTER_DEFAULTS,
  ComplaintFilters,
  type ComplaintFilterValues,
  toComplaintQuery,
} from "@/components/complaints/complaint-filters";
import { ComplaintsTable } from "@/components/complaints/complaints-table";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ListPageSkeleton, TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssignedComplaints, useComplaints } from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { useAuth } from "@/providers";

const DEFAULTS = { ...COMPLAINT_FILTER_DEFAULTS, scope: "all" };
type FilterValues = ComplaintFilterValues & { scope: string };

/**
 * The complaint queue.
 *
 * An admin sees the whole city here. An officer sees only their own department —
 * that narrowing happens in the service, not in this component, so it holds even
 * if the officer edits the URL. The scope tab lets an officer flip between the
 * department queue and the complaints assigned to them personally.
 */
export function ComplaintsView() {
  const { user, isLoading } = useAuth();
  const { values, setFilter, setPage, reset, isFiltered } =
    useFilterParams<FilterValues>(DEFAULTS);

  const query = toComplaintQuery(values);
  const isOfficer = user?.role === "OFFICER";
  const mineOnly = isOfficer && values.scope === "mine";

  const all = useComplaints(query);
  const assigned = useAssignedComplaints(query);
  const active = mineOnly ? assigned : all;

  if (isLoading) return <ListPageSkeleton rows={8} columns={5} />;

  const complaints = active.data?.items ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Complaints"
        description={
          isOfficer
            ? "Everything in your department, plus the complaints assigned to you."
            : "Every complaint across the city. Open one to assign it or move it along."
        }
      />

      {isOfficer && (
        <Tabs
          value={values.scope}
          onValueChange={(value) => setFilter("scope", String(value ?? "all"))}
        >
          <TabsList>
            <TabsTrigger value="all">My department</TabsTrigger>
            <TabsTrigger value="mine">Assigned to me</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <ComplaintFilters
        values={values}
        onChange={(key, value) => setFilter(key, value)}
        onReset={reset}
        isFiltered={isFiltered}
        showPriority
      />

      {active.isPending && <TableSkeleton rows={6} columns={6} />}

      {active.isError && (
        <ErrorState
          error={active.error}
          onRetry={() => void active.refetch()}
        />
      )}

      {!active.isPending && !active.isError && complaints.length === 0 && (
        <EmptyState
          icon={ClipboardListIcon}
          title={
            isFiltered ? "Nothing matches those filters" : "No complaints here"
          }
          description={
            isFiltered
              ? "Widen the status or clear the search box."
              : mineOnly
                ? "Nothing is assigned to you at the moment."
                : "No complaints have been filed against this department yet."
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

      {complaints.length > 0 && (
        <>
          <Card
            className={
              active.isPlaceholderData
                ? "overflow-hidden p-0 opacity-60 transition-opacity"
                : "overflow-hidden p-0"
            }
          >
            <CardContent className="p-0">
              <ComplaintsTable
                complaints={complaints}
                showOfficer={!mineOnly}
              />
            </CardContent>
          </Card>

          <DataPagination
            meta={active.data?.meta}
            page={query.page}
            onPageChange={setPage}
            label="complaints"
          />
        </>
      )}
    </div>
  );
}
