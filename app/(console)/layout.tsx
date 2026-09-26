import { ConsoleHeader } from "@/components/layout/console-header";
import { ConsoleSidebar } from "@/components/layout/console-sidebar";
import { RoleGate } from "@/components/layout/role-gate";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ConsoleLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <ConsoleSidebar />
      <SidebarInset>
        <ConsoleHeader />
        {/* The gate is inside the shell on purpose: a citizen who reaches this
            URL should see the refusal in a recognisable frame, not a blank page. */}
        <RoleGate>{children}</RoleGate>
      </SidebarInset>
    </SidebarProvider>
  );
}
