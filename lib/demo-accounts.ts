export type DemoRole = "officer" | "admin";

/**
 * The seeded evaluation accounts behind the one-click buttons on the sign-in
 * page.
 *
 * These are in the bundle on purpose: they are what the seed prints and the
 * README publishes, they only exist on a demo database, and the point of the
 * panel is that a reviewer does not have to type them. Set
 * `NEXT_PUBLIC_DEMO_LOGINS=off` and neither the panel nor these strings ship.
 *
 * Only the two staff roles live here. CityCare ships as two apps against one
 * API: residents sign in on the public site, which owns those sessions, and
 * nothing here navigates there. Both of these have two-factor off, which is
 * what makes one click actually land on a dashboard rather than on an OTP
 * screen.
 */
export const DEMO_ACCOUNTS = {
  officer: {
    label: "Officer",
    email: "officer1@citycare.com",
    password: "Officer@12345",
    blurb: "Work a ward queue and close complaints",
  },
  admin: {
    label: "Administrator",
    email: "admin@citycare.com",
    password: "Admin@12345",
    blurb: "Everything, plus roles and permissions",
  },
} as const satisfies Record<
  DemoRole,
  { label: string; email: string; password: string; blurb: string }
>;

export const DEMO_ROLES = ["officer", "admin"] as const;

/** Whether the panel renders at all. */
export const DEMO_LOGINS_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_LOGINS !== "off";
