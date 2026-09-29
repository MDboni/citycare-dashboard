import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the complaint queue. */
export default function Loading() {
  return <ListPageSkeleton rows={8} columns={5} />;
}
