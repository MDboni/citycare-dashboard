import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { ServiceRequestsView } from "./service-requests-view";

export const metadata: Metadata = { title: "Service requests" };

export default function ServiceRequestsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading applications" />}>
      <ServiceRequestsView />
    </Suspense>
  );
}
