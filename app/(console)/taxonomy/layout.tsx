import { AdminOnly } from "@/components/layout/role-gate";
import { TaxonomyNav } from "@/components/layout/taxonomy-nav";
import { PageHeader } from "@/components/shared/page-header";

export default function TaxonomyLayout({ children }: LayoutProps<"/taxonomy">) {
  return (
    <AdminOnly>
      <div className="space-y-6 p-4 sm:p-6">
        <PageHeader
          title="Taxonomy"
          description="The lists every complaint and service application is filed against. A category carries its own SLA, which is what the escalation job measures against."
        />
        <TaxonomyNav />
        <div className="space-y-4">{children}</div>
      </div>
    </AdminOnly>
  );
}
