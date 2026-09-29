import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/shared/loading";
import { ComplaintsView } from "./complaints-view";

export const metadata: Metadata = { title: "Complaints" };

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<ListPageSkeleton rows={8} columns={5} />}>
      <ComplaintsView />
    </Suspense>
  );
}
