import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — shared by all five taxonomy tables. */
export default function Loading() {
  return <ListPageSkeleton rows={6} columns={3} />;
}
