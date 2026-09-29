import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — a long audit table. */
export default function Loading() {
  return <ListPageSkeleton rows={10} columns={5} />;
}
