/**
 * Where a half-finished sign-in waits.
 *
 * A `challengeId` is 64 hex characters that stand in for a password that has
 * already been accepted, so it is a credential in its own right. It goes in
 * `sessionStorage` rather than the URL: a query string ends up in browser
 * history, in the referrer header and in any screenshot of the address bar,
 * and it outlives the tab. sessionStorage dies with the tab, which is exactly
 * the lifetime of the challenge itself.
 */
const KEY = "cc.pending-challenge";

export type PendingChallenge = {
  kind: "login" | "google" | "two-factor";
  challengeId: string;
  /** Masked by the server, e.g. `a***a@example.com` — safe to display. */
  email?: string;
  expiresAt: number;
};

/** Signup verification is keyed by email, not by a challenge id. */
const SIGNUP_KEY = "cc.pending-signup";

export type PendingSignup = {
  email: string;
  expiresAt: number;
};

const read = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing can refuse the write; the page falls back to asking again.
  }
};

const remove = (key: string) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Nothing to do — an unreadable store is already effectively empty.
  }
};

export const saveChallenge = (
  challenge: Omit<PendingChallenge, "expiresAt"> & { expiresInSec: number },
) =>
  write(KEY, {
    kind: challenge.kind,
    challengeId: challenge.challengeId,
    email: challenge.email,
    expiresAt: Date.now() + challenge.expiresInSec * 1000,
  } satisfies PendingChallenge);

/** Returns `null` once the window has passed, so a stale id is never sent. */
export const getChallenge = (): PendingChallenge | null => {
  const challenge = read<PendingChallenge>(KEY);
  if (!challenge) return null;
  if (challenge.expiresAt <= Date.now()) {
    remove(KEY);
    return null;
  }
  return challenge;
};

export const clearChallenge = () => remove(KEY);

export const saveSignup = (signup: { email: string; expiresInSec: number }) =>
  write(SIGNUP_KEY, {
    email: signup.email,
    expiresAt: Date.now() + signup.expiresInSec * 1000,
  } satisfies PendingSignup);

export const getSignup = (): PendingSignup | null =>
  read<PendingSignup>(SIGNUP_KEY);

export const clearSignup = () => remove(SIGNUP_KEY);
