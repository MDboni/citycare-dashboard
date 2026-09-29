import { cn } from "cn";
import { Loader2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      aria-hidden
    />
  );
}

/*
 * There is deliberately no full-page spinner here. A blank screen with a
 * turning circle tells someone nothing about what is coming; the page-shaped
 * skeletons below do, and they hold the layout so nothing jumps when the data
 * lands. Spinner above is the small one, for inside a button or beside a
 * label, where a shape-matched skeleton would be sillier than a turning circle.
 */

/**
 * Matches the row height of the tables, so nothing jumps when data lands.
 *
 * The index keys below are deliberate: a placeholder row has no identity beyond
 * its position, and the count never changes while one is on screen.
 */
export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity.
          key={`row-${rowIndex}`}
          className="flex items-center gap-4 rounded-lg border border-border px-3 py-3"
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholder cells have no identity.
              key={`cell-${rowIndex}-${columnIndex}`}
              className={cn("h-4", columnIndex === 0 ? "w-1/3" : "flex-1")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholder cards have no identity.
          key={`card-${index}`}
          className="space-y-3 rounded-xl border border-border p-4"
        >
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** The title-and-description block every page opens with. */
function PageHeaderSkeleton() {
  return (
    <div className="space-y-2.5">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

/**
 * The wrapper every route-level skeleton shares.
 *
 * The placeholder shapes are `aria-hidden` — announcing eight grey rectangles
 * helps nobody — but the wrapper is a live region saying "Loading", so a screen
 * reader is told the route is working rather than hearing silence.
 */
function LoadingShell({ children }: { children: ReactNode }) {
  // <output> already carries role="status" and a polite live region, so the
  // announcement comes from the element rather than from three ARIA attributes.
  return (
    <output className="block p-4 sm:p-6">
      <span className="sr-only">Loading</span>
      <div className="space-y-6" aria-hidden>
        {children}
      </div>
    </output>
  );
}

/** A filter row above a list: a search box and a couple of dropdowns. */
function FilterBarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton className="h-9 w-full max-w-xs" />
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

/** A filtered list or table page. */
export function ListPageSkeleton({
  rows = 6,
  columns = 4,
  filters = true,
}: {
  rows?: number;
  columns?: number;
  filters?: boolean;
}) {
  return (
    <LoadingShell>
      <PageHeaderSkeleton />
      {filters && <FilterBarSkeleton />}
      <TableSkeleton rows={rows} columns={columns} />
    </LoadingShell>
  );
}

/** A catalogue or dashboard page built out of cards. */
export function GridPageSkeleton({ count = 6 }: { count?: number }) {
  return (
    <LoadingShell>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={count} />
    </LoadingShell>
  );
}

/** A single record: the body on the left, supporting panels on the right. */
export function DetailPageSkeleton() {
  return (
    <LoadingShell>
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </LoadingShell>
  );
}

/** A form page: one column of fields under the heading. */
export function FormPageSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <LoadingShell>
      <PageHeaderSkeleton />
      <div className="max-w-2xl space-y-5 rounded-xl border border-border p-6">
        {Array.from({ length: fields }).map((_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder fields have no identity.
            key={`field-${index}`}
            className="space-y-2"
          >
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-36" />
      </div>
    </LoadingShell>
  );
}
