import type { Metadata } from "next";
import { ComplaintDetailView } from "./complaint-detail-view";

export const metadata: Metadata = { title: "Complaint" };

export default async function ComplaintDetailPage(
  props: PageProps<"/complaints/[id]">,
) {
  const { id } = await props.params;
  return <ComplaintDetailView id={id} />;
}
