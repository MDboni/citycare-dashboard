"use client";

import { ShieldAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/providers";
import type { Role } from "@/types";

const STAFF_ROLES: Role[] = ["ADMIN", "OFFICER"];

/**
 * Keeps a citizen account out of the console.
 *
 * The proxy can only see whether a session cookie exists; it cannot read a role
 * out of a signed token without verifying it, and verifying it at the edge would
 * duplicate work the API already does properly. So the role check happens here,
 * once the profile has loaded. Nothing is protected by this component — every
 * endpoint behind it enforces its own role — it just gives an honest answer
 * instead of a wall of failed requests.
 */
export function RoleGate({
  children,
  allow = STAFF_ROLES,
}: {
  children: ReactNode;
  allow?: Role[];
}) {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading || !user)
    return <FullPageSpinner label="Checking your access" />;

  if (!allow.includes(user.role)) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlertIcon className="size-6" />
            </span>

            <div className="space-y-1.5">
              <h1 className="h-section">This console is for staff</h1>
              <p className="text-sm text-muted-foreground">
                Your account is a citizen account. Complaints, applications and
                payments all live in the main CityCare site.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                void signOut();
              }}
            >
              Sign in with another account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

/** The same idea for a page that only an administrator may open. */
export function AdminOnly({
  children,
  superAdmin = false,
}: {
  children: ReactNode;
  superAdmin?: boolean;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user)
    return <FullPageSpinner label="Checking your access" />;

  const allowed = user.role === "ADMIN" && (!superAdmin || user.isSuperAdmin);

  if (!allowed) {
    return (
      <div className="p-6">
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-warning/15 text-warning">
              <ShieldAlertIcon className="size-5" />
            </span>
            <div className="space-y-1">
              <h1 className="h-card">Not available on your account</h1>
              <p className="text-sm text-muted-foreground">
                {superAdmin
                  ? "This page is limited to super administrators."
                  : "This page is limited to administrators."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
