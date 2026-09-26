import { cn } from "cn";
import { COMPLAINT_STATUS_META } from "@/lib/constants";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { ComplaintStatus } from "@/types";

export type TimelineEntry = {
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  createdAt: string;
  note?: string | null;
};

/**
 * The status history as a vertical rail. Only transitions that actually happened
 * appear: a complaint that was never escalated shows no escalation step, which
 * is the difference between a history and a checklist.
 */
export function StatusTimeline({
  entries,
  className,
}: {
  entries: TimelineEntry[];
  className?: string;
}) {
  if (!entries.length) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Nothing has happened yet beyond the report itself.
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {entries.map((entry, index) => {
        const meta = COMPLAINT_STATUS_META[entry.toStatus];
        const isLast = index === entries.length - 1;

        return (
          <li
            key={`${entry.toStatus}-${entry.createdAt}`}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {/* The connector stops at the last dot rather than trailing off. */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute top-3 left-[5px] h-full w-px bg-border"
              />
            )}

            <span
              aria-hidden
              className={cn(
                "relative mt-1.5 size-2.5 shrink-0 rounded-full ring-3 ring-background",
                meta.accent,
              )}
            />

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <p className="text-sm font-medium">{meta.label}</p>
                {entry.fromStatus && (
                  <p className="text-xs text-muted-foreground">
                    from {COMPLAINT_STATUS_META[entry.fromStatus].label}
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                <time dateTime={entry.createdAt}>
                  {formatDateTime(entry.createdAt)}
                </time>
                <span className="mx-1.5" aria-hidden>
                  ·
                </span>
                {formatRelative(entry.createdAt)}
              </p>

              {entry.note && (
                <p className="mt-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-sm text-muted-foreground">
                  {entry.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
