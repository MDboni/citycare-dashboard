import { GridPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — SLA figures as stat cards. */
export default function Loading() {
  return <GridPageSkeleton count={4} />;
}
