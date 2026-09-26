import { GaugeIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/routes";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="surface-wash flex min-h-dvh flex-col">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
        <Logo />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center sm:px-6">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="h-display max-w-lg">No such page in the console</h1>
        <p className="max-w-md text-muted-foreground">
          The link may be from an older version of the console, or the address
          may have a typo in it.
        </p>

        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={routes.home} />}
        >
          <GaugeIcon data-icon="inline-start" />
          Back to the overview
        </Button>
      </main>
    </div>
  );
}
