import type { Metadata } from "next";
import { AdminOnly } from "@/components/layout/role-gate";
import { StaffView } from "./staff-view";

export const metadata: Metadata = { title: "Staff" };

export default function StaffPage() {
  return (
    <AdminOnly>
      <StaffView />
    </AdminOnly>
  );
}
