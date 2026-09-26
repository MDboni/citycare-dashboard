"use client";

import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/routes";

/**
 * Last resort for a render that threw. Failed requests are handled by ErrorState
 * inside the pages, so anything that reaches here is a bug — which is why the
 * digest is shown rather than a friendly guess.
 */
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="surface-wash flex min-h-dvh flex-col">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center sm:px-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlertIcon className="size-6" />
        </span>

        <h1 className="h-section max-w-lg">The console hit an error</h1>
        <p className="max-w-md text-muted-foreground">
          No change was lost — the API only records what it accepted. Try again,
          and quote the reference below if it keeps happening.
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
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href={routes.home} />}
          >
            Back to the overview
          </Button>
        </div>
      </main>
    </div>
  );
}
