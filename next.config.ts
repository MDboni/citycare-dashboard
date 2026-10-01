import type { NextConfig } from "next";

/**
 * The API is on a different origin and which one depends on the environment, so
 * `connect-src` is derived from the same variable the browser client reads
 * rather than hard-coded. Getting this wrong is silent at build time and fatal
 * in the browser: every fetch is blocked with nothing but a console message.
 */
const apiOrigin = (() => {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:5000";
  }
})();

const isDev = process.env.NODE_ENV === "development";

/**
 * No nonce, deliberately.
 *
 * Next inlines its hydration bootstrap, so a strict `script-src` needs a
 * per-request nonce — and a nonce forces every page to render dynamically,
 * which would turn this console's prerendered pages into serverless functions
 * and walk it straight back into the Hobby plan's function ceiling. The trade
 * is stated plainly: `'unsafe-inline'` does not stop an injected inline script.
 * What the rest of this policy stops is that script loading more code, reaching
 * any origin but our own API, rewriting `<base>`, posting a form somewhere else,
 * or framing the page.
 *
 * There is no Google entry here: the console has no Google sign-in button.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // next/font/google self-hosts at build time, so no external font origin.
  "font-src 'self' data:",
  // Complaint attachments, and avatars for staff who signed up through Google.
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
  `connect-src 'self' ${apiOrigin}${isDev ? " ws: wss:" : ""}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // No geolocation here — only the citizen app asks for a location.
    key: "Permissions-Policy",
    value:
      "clipboard-write=(self), geolocation=(), camera=(), microphone=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    /**
     * `complaint-attachments.tsx` renders Cloudinary URLs through next/image,
     * which refuses any host that is not listed here — so without this entry
     * every complaint photo in the console throws instead of loading.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Profile pictures for staff accounts created through Google.
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
