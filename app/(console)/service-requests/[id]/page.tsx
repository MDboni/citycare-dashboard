import type { Metadata } from "next";
import { RequestDetailView } from "./request-detail-view";

export const metadata: Metadata = { title: "Service request" };

export default async function ServiceRequestDetailPage(
  props: PageProps<"/service-requests/[id]">,
) {
  const { id } = await props.params;
  return <RequestDetailView id={id} />;
}
