import type { Role, SessionUser } from "@/types";

/**
 * Where the token pair lives.
 *
 * The API hands the tokens back in a JSON body rather than in a Set-Cookie, so
 * the client is the one that has to store them. Cookies rather than
 * localStorage, because `proxy.ts` runs before the page does and a cookie is
 * the only thing it can read — a localStorage guard would have to wait for
 * React to mount and would flash the protected page first.
 *
 * The trade-off is deliberate and worth naming: these cookies are readable by
 * script, so they are not XSS-proof. The access token is short lived (15m) and
 * the refresh token is single use and rotated server-side, which is what keeps
 * the blast radius small.
 */
export const COOKIE = {
  accessToken: "cc_at",
  refreshToken: "cc_rt",
  role: "cc_role",
} as const;

const ACCESS_MAX_AGE = 60 * 60; // the token itself expires in 15m; 1h of slack
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // matches JWT_REFRESH_EXPIRES_IN

const isBrowser = () => typeof document !== "undefined";

const writeCookie = (name: string, value: string, maxAge: number) => {
  if (!isBrowser()) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // The tokens arrive in a JSON body, so the client has to write the cookie
  // itself, and CookieStore is not available in every supported browser.
  // biome-ignore lint/suspicious/noDocumentCookie: see above.
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

const clearCookie = (name: string) => {
  if (!isBrowser()) return;
  // biome-ignore lint/suspicious/noDocumentCookie: same reason as writeCookie.
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const readCookie = (name: string): string | null => {
  if (!isBrowser()) return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
};

export const getAccessToken = () => readCookie(COOKIE.accessToken);
export const getRefreshToken = () => readCookie(COOKIE.refreshToken);
export const getStoredRole = () => readCookie(COOKIE.role) as Role | null;

/** Called on every successful login and on every silent token refresh. */
export const saveSession = (tokens: {
  accessToken: string;
  refreshToken: string;
  user?: SessionUser;
}) => {
  writeCookie(COOKIE.accessToken, tokens.accessToken, ACCESS_MAX_AGE);
  writeCookie(COOKIE.refreshToken, tokens.refreshToken, REFRESH_MAX_AGE);
  if (tokens.user) writeCookie(COOKIE.role, tokens.user.role, REFRESH_MAX_AGE);
};

export const clearSession = () => {
  clearCookie(COOKIE.accessToken);
  clearCookie(COOKIE.refreshToken);
  clearCookie(COOKIE.role);
};

/**
 * The "remember this device" token, which lets a 2FA account skip the OTP.
 *
 * It goes in localStorage and travels in the request body, not in a cookie: the
 * API is a different origin, so a cookie written here would never be sent to it.
 * It is opaque, single-device and revocable server-side.
 */
const DEVICE_TOKEN_KEY = "cc.device-token";

export const getDeviceToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(DEVICE_TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

export const saveDeviceToken = (token: string | undefined) => {
  if (typeof window === "undefined" || !token) return;
  try {
    window.localStorage.setItem(DEVICE_TOKEN_KEY, token);
  } catch {
    // A refused write only means the next sign-in asks for an OTP again.
  }
};

export const clearDeviceToken = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEVICE_TOKEN_KEY);
  } catch {
    // Nothing to clean up.
  }
};
