"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import type { ApiMeta } from "@/types";

/**
 * Pagination driven by component state rather than by hrefs, because every list
 * in the app filters client-side and a link would drop the filters.
 *
 * The window is at most seven slots: first, last, the current page and one
 * neighbour either side, with an ellipsis wherever a gap appears.
 */
const pageWindow = (current: number, total: number): (number | "gap")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);

  // Near either end there is no gap to show, so the window widens instead.
  const edgeFill =
    current <= 3
      ? [2, 3, 4]
      : current >= total - 2
        ? [total - 1, total - 2, total - 3]
        : [];
  for (const page of edgeFill) pages.add(page);

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }
  return out;
};

export function DataPagination({
  meta,
  page,
  onPageChange,
  label = "results",
}: {
  meta: ApiMeta | undefined;
  page: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  const total = Number(meta?.total ?? 0);
  const totalPages = Number(meta?.totalPages ?? 1);
  const limit = Number(meta?.limit ?? 10);

  if (!total) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)} {label}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>

          {pageWindow(page, totalPages).map((slot, index) =>
            slot === "gap" ? (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: a gap has no identity beyond its position in the window.
                key={`gap-${index}`}
                aria-hidden
                className="px-1 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={slot}
                variant={slot === page ? "default" : "ghost"}
                size="icon-sm"
                aria-label={`Page ${slot}`}
                aria-current={slot === page ? "page" : undefined}
                onClick={() => onPageChange(slot)}
              >
                {slot}
              </Button>
            ),
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
        </nav>
      )}
    </div>
  );
}
