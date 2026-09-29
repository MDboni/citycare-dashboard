import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the staff directory. */
export default function Loading() {
  return <ListPageSkeleton rows={8} columns={4} />;
}
