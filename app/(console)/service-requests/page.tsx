import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/shared/loading";
import { ServiceRequestsView } from "./service-requests-view";

export const metadata: Metadata = { title: "Service requests" };

export default function ServiceRequestsPage() {
  return (
    <Suspense fallback={<ListPageSkeleton rows={8} columns={5} />}>
      <ServiceRequestsView />
    </Suspense>
  );
}
