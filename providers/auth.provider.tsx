"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, usersApi } from "@/api-client";
import { queryKeys } from "@/hooks/query-keys";
import { ApiError } from "@/lib/api-error";
import { leaveAuthScreen } from "@/lib/navigate";
import {
  clearSession,
  getAccessToken,
  saveSession as persistSession,
} from "@/lib/session";
import { routes } from "@/routes";
import type { Profile, SessionUser } from "@/types";

type AuthContextValue = {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Stores a fresh token pair and pulls the full profile in behind it. */
  signIn: (tokens: {
    accessToken: string;
    refreshToken: string;
    user: SessionUser;
  }) => Promise<void>;
  signOut: (options?: { everywhere?: boolean }) => Promise<void>;
  refresh: () => Promise<unknown>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  /**
   * Whether the browser has taken over.
   *
   * Every signed-in/signed-out decision below starts from a cookie, and the
   * server has no cookies to read — `readCookie` answers null there and the
   * truth here, so the server and the first client render disagree and React
   * throws the tree away. Holding one deterministic answer ("still loading")
   * until after that first paint makes both sides agree; the real state lands
   * a tick later, which is a frame of skeleton rather than a re-render of the
   * whole page.
   *
   * Loading, specifically, and not signed-out: flashing a Sign in button at
   * someone who is signed in reads as having been logged out.
   */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  /**
   * `/users/me` is the single source of truth for who is signed in. The cookie
   * only decides whether it is worth asking: a cookie can be stale, a 401 from
   * this query cannot.
   */
  const { data, isLoading, isFetched, refetch } = useQuery({
    queryKey: queryKeys.me,
    queryFn: usersApi.me,
    enabled: hydrated && Boolean(getAccessToken()),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) =>
      // An expired session is an answer, not a flake worth retrying.
      //
      // One retry, not two: this query gates the whole UI, so every attempt it
      // makes is time the person spends looking at a skeleton. With a request
      // timeout on top, an unreachable API now settles into a signed-out screen
      // they can act on instead of a spinner that never ends.
      !(
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) && failureCount < 1,
  });

  const signIn = useCallback(
    async (tokens: {
      accessToken: string;
      refreshToken: string;
      user: SessionUser;
    }) => {
      persistSession(tokens);
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      await refetch();
    },
    [queryClient, refetch],
  );

  const signOut = useCallback(
    async (options?: { everywhere?: boolean }) => {
      /**
       * The ordinary sign-out goes as a beacon, which the browser finishes
       * after this page is gone — so the screen can change at once instead of
       * waiting out a round trip to revoke a session the person has already
       * left. "Everywhere" is different: it reports how many sessions it ended,
       * and a number nobody waited for is not worth printing.
       */
      if (options?.everywhere) {
        try {
          await authApi.logoutAll();
        } catch {
          // A dead session cannot be logged out of; clearing locally is the point.
        }
      } else if (!authApi.logoutBeacon()) {
        // The browser would not queue it. Fall back to the request that has to
        // be waited for rather than leaving the session alive on the server.
        try {
          await authApi.logout();
        } catch {
          // Same as above.
        }
      }

      clearSession();
      queryClient.clear();
      // The same cache problem as signing in, pointing the other way: every
      // console route the Router Cache holds was rendered for a session that no
      // longer exists. A full load is the only way to be sure none of it is
      // still on screen.
      leaveAuthScreen(routes.login);
    },
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      // Before hydration, and before the first fetch settles, treat this as
      // loading so a guarded page shows a skeleton rather than flashing a
      // signed-out state at someone who is signed in.
      isLoading:
        !hydrated || isLoading || (Boolean(getAccessToken()) && !isFetched),
      isAuthenticated: Boolean(data),
      signIn,
      signOut,
      refresh: refetch,
    }),
    [data, hydrated, isLoading, isFetched, signIn, signOut, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};
