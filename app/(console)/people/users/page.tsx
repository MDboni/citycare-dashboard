import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/components/layout/role-gate";
import { FullPageSpinner } from "@/components/shared/loading";
import { UsersView } from "./users-view";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return (
    <AdminOnly>
      <Suspense fallback={<FullPageSpinner label="Loading users" />}>
        <UsersView />
      </Suspense>
    </AdminOnly>
  );
}
