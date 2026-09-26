"use client";

import { FullPageSpinner } from "@/components/shared/loading";
import { useAuth } from "@/providers";
import { AdminOverview } from "./admin-overview";
import { OfficerOverview } from "./officer-overview";

/**
 * One route, two dashboards. An admin gets the city; an officer gets their own
 * queue. Splitting by role here rather than by URL means a shared bookmark works
 * for whoever opens it.
 */
export default function ConsoleHomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user)
    return <FullPageSpinner label="Loading your overview" />;

  return user.role === "ADMIN" ? <AdminOverview /> : <OfficerOverview />;
}
