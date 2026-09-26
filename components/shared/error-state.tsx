"use client";

import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorMessage, toApiError } from "@/lib/api-error";

/**
 * The counterpart to EmptyState for a failed query. It shows the API's own
 * message — those are written for users — and the request id, which is what
 * makes a support conversation about a 500 possible at all.
 */
export function ErrorState({
  error,
  onRetry,
  title = "That did not load",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const api = toApiError(error);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {errorMessage(error)}
        </p>
        {api.requestId && (
          <p className="font-mono text-xs text-muted-foreground/70">
            Request {api.requestId}
          </p>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCwIcon />
          Try again
        </Button>
      )}
    </div>
  );
}
