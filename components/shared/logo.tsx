import { cn } from "cn";
import Link from "next/link";
import { routes } from "@/routes";

/**
 * The mark is a pin knocked out of a solid tile.
 *
 * It is drawn rather than imported, and the same geometry is duplicated once in
 * `app/icon.svg` and once in the citizen app, so every CityCare surface — both
 * browser tabs, the installed icons, both headers — carries one shape. Knockout rather than a stroked outline is the whole point: a
 * 1.8px stroke and a 2.6px arc, which is what this used to be, turn to grey mush
 * at the 16px a favicon is actually rendered at.
 *
 * The tile stays a `<span>` with theme classes instead of an SVG gradient — a
 * gradient needs an id, a repeated id needs `useId`, and `useId` would force
 * `"use client"` on a component the footer renders on the server for free.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-sm ring-1 ring-white/15 ring-inset",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[19px]" role="presentation">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 2.4c-3.75 0-6.8 3.02-6.8 6.75 0 2.35 1.34 4.86 2.77 6.83a28 28 0 0 0 3.32 3.79c.4.38 1.02.38 1.42 0a28 28 0 0 0 3.32-3.79c1.43-1.97 2.77-4.48 2.77-6.83C18.8 5.42 15.75 2.4 12 2.4Zm0 9.5a2.62 2.62 0 1 1 0-5.25 2.62 2.62 0 0 1 0 5.25Z"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  href = routes.home,
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <LogoMark className="transition-transform duration-200 ease-out group-hover:-rotate-3 group-hover:scale-105 group-active:scale-95 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100" />
      <span className="font-heading text-base font-semibold tracking-tight">
        City<span className="text-primary">Care</span>
        <span className="ml-1.5 rounded-md bg-muted px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Staff
        </span>
      </span>
    </Link>
  );
}
