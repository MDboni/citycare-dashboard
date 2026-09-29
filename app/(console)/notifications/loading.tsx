import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — an unfiltered feed. */
export default function Loading() {
  return <ListPageSkeleton rows={8} columns={2} filters={false} />;
}
