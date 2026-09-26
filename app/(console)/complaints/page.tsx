import type { Metadata } from "next";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/shared/loading";
import { ComplaintsView } from "./complaints-view";

export const metadata: Metadata = { title: "Complaints" };

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Loading complaints" />}>
      <ComplaintsView />
    </Suspense>
  );
}
