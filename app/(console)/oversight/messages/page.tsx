import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/components/layout/role-gate";
import { ListPageSkeleton } from "@/components/shared/loading";
import { MessagesView } from "./messages-view";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <AdminOnly>
      <Suspense fallback={<ListPageSkeleton rows={8} columns={5} />}>
        <MessagesView />
      </Suspense>
    </AdminOnly>
  );
}
