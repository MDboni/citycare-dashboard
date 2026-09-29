import { FormPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the account forms. */
export default function Loading() {
  return <FormPageSkeleton fields={5} />;
}
