import type { AuthProvider, Role, UserStatus } from "./enums.types";

/** The trimmed user the auth endpoints return alongside a token pair. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
};

/** `GET /users/me` — the full profile, built from the server's PROFILE_SELECT. */
export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  status: UserStatus;
  provider: AuthProvider;
  twoFactorEnabled: boolean;
  isSuperAdmin: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  ward: { id: string; number: number; name: string } | null;
  department: { id: string; name: string } | null;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

/** `POST /auth/register` and every resend: 202 with a masked address. */
export type OtpChallengeSent = {
  email: string;
  expiresInSec: number;
};

/** `POST /auth/login` answers one of these two. */
export type LoginResult =
  | ({ twoFactorRequired: false } & TokenPair)
  | {
      twoFactorRequired: true;
      challengeId: string;
      email: string;
      expiresInSec: number;
    };

/** `POST /auth/login/verify-otp` — plus the opaque token for a trusted device. */
export type VerifyLoginOtpResult = TokenPair & { deviceToken?: string };

/** `POST /auth/google/token` — a Google id token can land in three places. */
export type GoogleTokenResult =
  | { newUser: true; email: string; expiresInSec: number }
  | ({ newUser: false; twoFactorRequired: false } & TokenPair)
  | {
      newUser: false;
      twoFactorRequired: true;
      challengeId: string;
      email: string;
      expiresInSec: number;
    };

/** `PATCH /auth/2fa` — enabling it needs a second round trip with an OTP. */
export type Toggle2faResult =
  | { otpRequired: true; challengeId: string; expiresInSec: number }
  | { otpRequired: false; twoFactorEnabled: boolean };

export type AuthSession = {
  id: string;
  ip: string | null;
  userAgent: string | null;
  deviceName: string | null;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
  current: boolean;
};
