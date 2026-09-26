"use client";

import { ShieldXIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks";

/**
 * Hides what the signed-in staff member may not use.
 *
 * This is an honesty layer, not a control. Every endpoint behind it re-checks
 * the same permission server-side on every request, which is the check that
 * actually matters — this one only stops the console offering a button that
 * would come back 403. Treating it as security would be a mistake: the bundle
 * ships to the browser and anyone can read it.
 */
export function PermissionGate({
  children,
  /** Any one of these is enough, matching how the API's guards are written. */
  permission,
  /** What to show instead. `null` renders nothing, which suits menu items. */
  fallback,
}: {
  children: ReactNode;
  permission: string | string[];
  fallback?: ReactNode;
}) {
  const { can, isLoading } = usePermission();
  const codes = Array.isArray(permission) ? permission : [permission];

  // Render nothing rather than a refusal while the answer is still in flight,
  // or a permitted user sees "no access" flash before their own page loads.
  if (isLoading) {
    return fallback === null ? null : <Skeleton className="h-24 w-full" />;
  }

  if (!can(...codes)) {
    if (fallback !== undefined) return <>{fallback}</>;
    return (
      <EmptyState
        icon={ShieldXIcon}
        title="You do not have access to this"
        description="Ask an administrator to add the matching permission to one of your roles."
      />
    );
  }

  return <>{children}</>;
}
