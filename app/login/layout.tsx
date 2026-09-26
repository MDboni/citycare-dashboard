import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return (
    <div className="surface-wash flex min-h-dvh flex-col">
      <header className="mx-auto flex h-14 w-full max-w-6xl shrink-0 items-center justify-between px-4 sm:px-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="mx-auto w-full max-w-6xl shrink-0 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        Every action taken in this console is written to the audit log with your
        name against it.
      </footer>
    </div>
  );
}
