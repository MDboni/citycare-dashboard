import { CardGridSkeleton, TableSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the four money cards, then the ledger. */
export default function Loading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <CardGridSkeleton count={4} />
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
