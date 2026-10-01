"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
      !(
        error instanceof ApiError &&
        error.status >= 400 &&
        error.status < 500
      ) && failureCount < 2,
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
      try {
        if (options?.everywhere) await authApi.logoutAll();
        else await authApi.logout();
      } catch {
        // A dead session cannot be logged out of; clearing locally is the point.
      }
      clearSession();
      queryClient.clear();
      router.replace(routes.login);
    },
    [queryClient, router],
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
