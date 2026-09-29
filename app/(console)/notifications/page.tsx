import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPageSkeleton } from "@/components/shared/loading";
import { NotificationsView } from "./notifications-view";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={<ListPageSkeleton rows={8} columns={2} filters={false} />}
    >
      <NotificationsView />
    </Suspense>
  );
}
