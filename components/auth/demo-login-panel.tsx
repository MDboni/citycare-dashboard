// biome-ignore-all lint/a11y/useAnchorContent: the one anchor here is a Base UI `render` target — Button supplies its children.
"use client";

import { ExternalLinkIcon, Loader2Icon, UserCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEMO_ACCOUNTS,
  DEMO_LOGINS_ENABLED,
  DEMO_ROLES,
  type DemoRole,
  demoHandoffUrl,
} from "@/lib/demo-accounts";

/**
 * One-click sign-in for each of the three roles.
 *
 * Officer and Administrator sign in here. CityCare ships as two apps against
 * one API, and a citizen has nothing to do in the console, so that button is a
 * real link that hands over to the resident app with `?demo=`; it reads that
 * on arrival and finishes the sign-in. Still one click.
 */
export function DemoLoginPanel({
  onDemo,
  pending,
}: {
  /** Runs the roles this app can sign in itself. */
  onDemo: (role: DemoRole) => void;
  pending: DemoRole | null;
}) {
  if (!DEMO_LOGINS_ENABLED) return null;

  return (
    <section
      aria-labelledby="demo-logins-heading"
      className="space-y-3 rounded-xl border border-dashed border-border bg-muted/40 p-4"
    >
      <div className="flex items-start gap-2.5">
        <UserCheckIcon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="space-y-0.5">
          <h2 id="demo-logins-heading" className="text-sm font-medium">
            Demo logins
          </h2>
          <p className="text-xs text-muted-foreground">
            Seeded accounts for reviewing the three roles. No typing.
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {DEMO_ROLES.map((role) => {
          const account = DEMO_ACCOUNTS[role];
          const isHandoff = role === "citizen";
          const busy = pending === role;
          const href = demoHandoffUrl(role);
          const label = `Sign in as ${account.label}`;

          /**
           * A handoff is another origin, so a real navigation rather than a
           * route push — and it opens in a new tab. Signing in to one app is
           * not a reason to lose the one you are standing in, and a reviewer
           * ends up with both roles open side by side, which is what the
           * walkthrough wants anyway.
           */
          const link = (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${label} (opens in a new tab)`}
            />
          );

          return (
            <li key={role}>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 bg-background py-2.5 text-left"
                disabled={pending !== null && !busy}
                nativeButton={!isHandoff}
                {...(isHandoff
                  ? { render: link }
                  : { onClick: () => onDemo(role) })}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
                  {account.label.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    Sign in as {account.label}
                  </span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {account.blurb}
                  </span>
                </span>
                {busy ? (
                  <Loader2Icon className="size-4 shrink-0 animate-spin" />
                ) : isHandoff ? (
                  <ExternalLinkIcon
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                ) : null}
              </Button>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-muted-foreground">
        Citizen opens the resident app in a new tab — it is a separate
        deployment on the same API, so the console stays where it is.
      </p>
    </section>
  );
}
