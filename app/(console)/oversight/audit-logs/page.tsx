import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/components/layout/role-gate";
import { FullPageSpinner } from "@/components/shared/loading";
import { AuditLogsView } from "./audit-logs-view";

export const metadata: Metadata = { title: "Audit log" };

export default function AuditLogsPage() {
  return (
    <AdminOnly>
      <Suspense fallback={<FullPageSpinner label="Loading the audit trail" />}>
        <AuditLogsView />
      </Suspense>
    </AdminOnly>
  );
}
