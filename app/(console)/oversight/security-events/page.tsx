import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/components/layout/role-gate";
import { ListPageSkeleton } from "@/components/shared/loading";
import { SecurityEventsView } from "./security-events-view";

export const metadata: Metadata = { title: "Security events" };

export default function SecurityEventsPage() {
  return (
    <AdminOnly superAdmin>
      <Suspense fallback={<ListPageSkeleton rows={10} columns={5} />}>
        <SecurityEventsView />
      </Suspense>
    </AdminOnly>
  );
}
