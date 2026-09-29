import { GridPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the fallback for any console route without its own. */
export default function Loading() {
  return <GridPageSkeleton count={4} />;
}
