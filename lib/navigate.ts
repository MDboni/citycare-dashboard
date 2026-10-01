/**
 * Leaves a sign-in screen with a full document load, not a client navigation.
 *
 * `proxy.ts` decides every route in this console from the `cc_rt` cookie, and
 * Next's client Router Cache may already hold the answer it gave before that
 * cookie existed. The logo in the sign-in layout links to `/`, so Next
 * prefetches `/` while nobody is signed in, the Proxy answers with a redirect
 * to `/login?next=/`, and that is what gets cached. `router.replace("/")` then
 * replays the cached redirect without asking the server at all — the person who
 * just signed in is put straight back on the form they came from, having done
 * nothing wrong. Reloading is the one thing that fixes it, because a reload is
 * the one thing that does not consult the cache.
 *
 * So the moment the session changes, stop trusting the cache. A hard load also
 * drops every piece of in-memory state belonging to the previous session, which
 * is exactly what both signing in and signing out want.
 *
 * `replace`, not `assign`: the sign-in screen should not be sitting in history
 * behind the page it let you into.
 */
export const leaveAuthScreen = (to: string) => {
  if (typeof window === "undefined") return;
  window.location.replace(to);
};
