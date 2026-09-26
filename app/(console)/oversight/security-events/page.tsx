import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/components/layout/role-gate";
import { FullPageSpinner } from "@/components/shared/loading";
import { SecurityEventsView } from "./security-events-view";

export const metadata: Metadata = { title: "Security events" };

export default function SecurityEventsPage() {
  return (
    <AdminOnly superAdmin>
      <Suspense fallback={<FullPageSpinner label="Loading security events" />}>
        <SecurityEventsView />
      </Suspense>
    </AdminOnly>
  );
}
