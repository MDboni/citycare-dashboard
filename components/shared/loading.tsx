import { cn } from "cn";
import { Loader2Icon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      aria-hidden
    />
  );
}

export function FullPageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner className="size-6" />
      <p className="text-sm text-muted-foreground">{label}...</p>
    </div>
  );
}

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
