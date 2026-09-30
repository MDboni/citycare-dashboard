import type { Metadata } from "next";
import { Suspense } from "react";
import { PermissionGate } from "@/components/layout/permission-gate";
import { AdminOnly } from "@/components/layout/role-gate";
import { ListPageSkeleton } from "@/components/shared/loading";
import { PaymentsView } from "./payments-view";

export const metadata: Metadata = { title: "Payments" };

/**
 * Both gates, deliberately.
 *
 * `AdminOnly` because the API refuses this to an officer whatever permissions
 * they hold, and `PermissionGate` because an admin can have
 * `payments__view_all` taken away from them — in which case this page should
 * say so in the console frame rather than let three requests come back 403 and
 * leave an error card where the money was.
 */
export default function PaymentsPage() {
  return (
    <AdminOnly>
      <PermissionGate permission="payments__view_all">
        <Suspense fallback={<ListPageSkeleton rows={8} columns={6} />}>
          <PaymentsView />
        </Suspense>
      </PermissionGate>
    </AdminOnly>
  );
}
