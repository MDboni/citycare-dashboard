import { AdminOnly } from "@/components/layout/role-gate";
import { SettingsNav } from "@/components/layout/settings-nav";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <AdminOnly>
      <div className="space-y-6 p-4 sm:p-6">
        <PageHeader
          title="Settings"
          description="The knobs behind the console: how complaints behave city-wide, and who is allowed to do what."
        />
        <SettingsNav />
        <div className="space-y-4">{children}</div>
      </div>
    </AdminOnly>
  );
}
