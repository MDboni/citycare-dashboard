"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/routes";

const ITEMS = [
  { href: routes.taxonomy.departments, label: "Departments" },
  { href: routes.taxonomy.categories, label: "Categories" },
  { href: routes.taxonomy.wards, label: "Wards" },
  { href: routes.taxonomy.zones, label: "Zones" },
  { href: routes.taxonomy.serviceTypes, label: "Service types" },
] as const;

/**
 * Looks like a tab strip but is real navigation, so each list keeps its own URL
 * and the back button behaves.
 */
export function TaxonomyNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Taxonomy sections"
      className="-mx-1 flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-muted p-[3px]"
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-background text-foreground shadow-sm dark:bg-input/30"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
