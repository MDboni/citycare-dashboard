"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ComponentProps, useEffect } from "react";

const LIGHT = "#ffffff";
const DARK = "#12161d";

/**
 * The two things that have to happen on the client once the theme is known.
 *
 * Its own component because both need `useTheme`, and `useTheme` only works
 * underneath the provider — a hook cannot read the context its own parent
 * supplies.
 */
function ThemeEffects() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  /**
   * Anybody still carrying "system" in storage moves to the default.
   *
   * next-themes does not check a stored value against the themes it was given:
   * with system switched off it takes "system" at face value and writes that
   * word onto <html> as a class, which nothing styles. Runs once, and only for
   * people who chose System while it still existed.
   */
  useEffect(() => {
    if (theme === "system") setTheme("light");
  }, [theme, setTheme]);

  /**
   * The browser chrome follows the page, not the operating system.
   *
   * This used to be two <meta> tags behind prefers-color-scheme media queries,
   * which was right while the app followed the OS too. It does not any more, so
   * a phone in dark mode showing a light page would have painted a dark address
   * bar above it.
   */
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", resolvedTheme === "dark" ? DARK : LIGHT);
  }, [resolvedTheme]);

  return null;
}

export default function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark"]}
      disableTransitionOnChange
      {...props}
    >
      <ThemeEffects />
      {children}
    </NextThemesProvider>
  );
}
