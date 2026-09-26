"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api";
import { errorMessage } from "@/lib/api-error";

/**
 * The auth mutations that do not need the signed-in session. Each one is a thin
 * wrapper: the pages own the branching, because "2FA required" is a different
 * screen rather than a different error.
 */
export const useRegister = () => useMutation({ mutationFn: authApi.register });

export const useVerifySignupOtp = () =>
  useMutation({ mutationFn: authApi.verifySignupOtp });

export const useResendSignupOtp = () =>
  useMutation({ mutationFn: authApi.resendSignupOtp });

export const useLogin = () => useMutation({ mutationFn: authApi.login });

export const useVerifyLoginOtp = () =>
  useMutation({ mutationFn: authApi.verifyLoginOtp });

export const useResendLoginOtp = () =>
  useMutation({ mutationFn: authApi.resendLoginOtp });

export const useForgotPassword = () =>
  useMutation({ mutationFn: authApi.forgotPassword });

export const useResetPassword = () =>
  useMutation({ mutationFn: authApi.resetPassword });

export const useGoogleTokenLogin = () =>
  useMutation({ mutationFn: authApi.googleToken });

export { errorMessage };
