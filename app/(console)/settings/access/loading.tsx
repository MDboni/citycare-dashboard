import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — roles and permissions under tabs. */
export default function Loading() {
  return <ListPageSkeleton rows={6} columns={3} />;
}
