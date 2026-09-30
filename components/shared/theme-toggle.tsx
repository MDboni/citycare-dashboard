"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Light and dark, and nothing else.
 *
 * There used to be a third entry, System, and a dropdown to hold the three.
 * Both are gone. The app no longer asks the operating system anything, so the
 * only question left is which of two — and a menu is two clicks to answer a
 * one-click question.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server cannot know which theme is on, so the icon waits for the client
  // rather than rendering the wrong one and swapping it. The label waits with
  // it: an attribute that differs between the two renders is a hydration
  // mismatch, and "Change theme" is true either way.
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={
        mounted ? `Switch to ${dark ? "light" : "dark"} theme` : "Change theme"
      }
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
