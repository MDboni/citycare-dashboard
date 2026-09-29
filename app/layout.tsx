import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CityCare staff console",
    template: "%s · CityCare console",
  },
  description:
    "Triage complaints, assign officers, process service requests and read the audit trail.",
  applicationName: "CityCare console",
  // A private console has nothing to gain from being indexed.
  robots: { index: false, follow: false },
  /**
   * Tells Dark Reader to leave the page alone.
   *
   * CityCare ships its own dark theme through next-themes, so the extension
   * has nothing to add — it only re-tints a palette that is already correct.
   * It was also rewriting the stroke on every icon between the server render
   * and hydration, which React reports as a hydration mismatch it cannot
   * patch up. This is the opt-out Dark Reader documents for sites that theme
   * themselves; it is a statement about this site, not a silenced warning.
   */
  other: { "darkreader-lock": "true" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#12161d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
