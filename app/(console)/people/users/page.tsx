import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/components/layout/role-gate";
import { ListPageSkeleton } from "@/components/shared/loading";
import { UsersView } from "./users-view";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return (
    <AdminOnly>
      <Suspense fallback={<ListPageSkeleton rows={8} columns={4} />}>
        <UsersView />
      </Suspense>
    </AdminOnly>
  );
}
