import { api, apiRequest, BASE_URL } from "@/lib/api-client";
import { getAccessToken, getRefreshToken } from "@/lib/session";
import type {
  AuthSession,
  GoogleTokenResult,
  LoginResult,
  OtpChallengeSent,
  Toggle2faResult,
  TokenPair,
  VerifyLoginOtpResult,
} from "@/types";

/** Every call here is anonymous unless it needs the caller's own session. */
export const authApi = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    api<OtpChallengeSent>("/auth/register", {
      method: "POST",
      body,
      anonymous: true,
    }),

  verifySignupOtp: (body: { email: string; otp: string }) =>
    api<TokenPair>("/auth/verify-otp", {
      method: "POST",
      body,
      anonymous: true,
    }),

  resendSignupOtp: (body: { email: string }) =>
    api<OtpChallengeSent>("/auth/resend-otp", {
      method: "POST",
      body,
      anonymous: true,
    }),

  login: (body: { email: string; password: string; deviceToken?: string }) =>
    api<LoginResult>("/auth/login", {
      method: "POST",
      body,
      anonymous: true,
    }),

  verifyLoginOtp: (body: {
    challengeId: string;
    otp: string;
    trustDevice?: boolean;
  }) =>
    api<VerifyLoginOtpResult>("/auth/login/verify-otp", {
      method: "POST",
      body,
      anonymous: true,
    }),

  resendLoginOtp: (body: { challengeId: string }) =>
    api<{ challengeId: string; expiresInSec: number }>(
      "/auth/login/resend-otp",
      { method: "POST", body, anonymous: true },
    ),

  forgotPassword: (body: { email: string }) =>
    apiRequest<null>("/auth/forgot-password", {
      method: "POST",
      body,
      anonymous: true,
    }),

  resetPassword: (body: { token: string; password: string }) =>
    apiRequest<null>("/auth/reset-password", {
      method: "POST",
      body,
      anonymous: true,
    }),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiRequest<null>("/auth/change-password", { method: "PATCH", body }),

  /** Enabling 2FA answers 202 with a challenge; confirming it answers 200. */
  toggle2fa: (body: {
    enabled: boolean;
    password: string;
    challengeId?: string;
    otp?: string;
  }) => api<Toggle2faResult>("/auth/2fa", { method: "PATCH", body }),

  googleToken: (body: { idToken: string }) =>
    api<GoogleTokenResult>("/auth/google/token", {
      method: "POST",
      body,
      anonymous: true,
    }),

  refresh: (body: { refreshToken: string }) =>
    api<TokenPair>("/auth/refresh-token", {
      method: "POST",
      body,
      anonymous: true,
    }),

  logout: () => apiRequest<null>("/auth/logout", { method: "POST" }),

  /**
   * Sign-out for a page that is already leaving.
   *
   * `logout` above cannot be used for that: its Authorization header makes the
   * browser ask permission with a CORS preflight first, and the page is gone
   * before the answer arrives — measured, and the session survived. A beacon
   * posts `text/plain` with no custom headers, which is a request the browser
   * sends without asking and finishes even after the document is torn down, so
   * the tokens travel in the body instead. Handing over a refresh token to have
   * it destroyed only ever takes privilege away from whoever holds it.
   *
   * Returns false when the browser declines to queue it — no `sendBeacon`, no
   * refresh token to send, or the queue is full — and the caller falls back to
   * the request that has to be waited for.
   */
  logoutBeacon: (): boolean => {
    if (typeof navigator === "undefined" || !navigator.sendBeacon) return false;

    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      return navigator.sendBeacon(
        `${BASE_URL}/auth/logout/beacon`,
        new Blob(
          [JSON.stringify({ refreshToken, accessToken: getAccessToken() })],
          {
            type: "text/plain;charset=UTF-8",
          },
        ),
      );
    } catch {
      return false;
    }
  },

  logoutAll: () =>
    api<{ revoked: number }>("/auth/logout-all", { method: "POST" }),

  sessions: () => api<AuthSession[]>("/auth/sessions"),

  revokeSession: (id: string) =>
    apiRequest<null>(`/auth/sessions/${id}`, { method: "DELETE" }),
};
