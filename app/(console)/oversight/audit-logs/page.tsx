import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/components/layout/role-gate";
import { ListPageSkeleton } from "@/components/shared/loading";
import { AuditLogsView } from "./audit-logs-view";

export const metadata: Metadata = { title: "Audit log" };

export default function AuditLogsPage() {
  return (
    <AdminOnly>
      <Suspense fallback={<ListPageSkeleton rows={10} columns={5} />}>
        <AuditLogsView />
      </Suspense>
    </AdminOnly>
  );
}
