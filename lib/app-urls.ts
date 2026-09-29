/**
 * Where the resident half of CityCare lives.
 *
 * Residents and staff run as two deployments against one API, so sending
 * someone across is a real navigation to another origin, not a route push.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
