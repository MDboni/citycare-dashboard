"use client";

import { LogOutIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

/**
 * A console page threw.
 *
 * It sits here rather than only at the root so the shell outlives the error:
 * the root boundary replaces the sidebar and header too, which leaves someone
 * looking at a page with no way off it — and the one failure a retry never
 * fixes is a session that has gone wrong. Sign out is offered outright.
 */
export default function ConsoleSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { isAuthenticated, signOut } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-6" />
      </span>

      <h1 className="h-section max-w-lg">This page did not load</h1>
      <p className="max-w-md text-muted-foreground">
        Nothing you were doing was lost. Try again — and if it keeps happening,
        signing out and back in clears a session that has gone stale.
      </p>

      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">
          Reference {error.digest}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          <RefreshCwIcon data-icon="inline-start" />
          Try again
        </Button>

        {isAuthenticated ? (
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              void signOut();
            }}
          >
            <LogOutIcon data-icon="inline-start" />
            Sign out
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href={routes.home} />}
          >
            Back to the dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
