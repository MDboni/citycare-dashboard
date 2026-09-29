import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the contact form inbox. */
export default function Loading() {
  return <ListPageSkeleton rows={8} columns={5} />;
}
