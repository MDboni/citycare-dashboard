"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "./auth.provider";
import QueryProvider from "./query.provider";
import ThemeProvider from "./theme.provider";

export { useAuth } from "./auth.provider";

/**
 * No Google provider here. Staff accounts are created by an administrator and
 * sign in with a password plus a two-factor code, so the console never needs the
 * Google SDK.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
