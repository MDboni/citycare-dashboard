"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, usersApi } from "@/api";
import { queryKeys } from "./query-keys";

export const useSessions = () =>
  useQuery({ queryKey: queryKeys.sessions, queryFn: authApi.sessions });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateAvatar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
};

export const useChangePassword = () =>
  useMutation({ mutationFn: authApi.changePassword });

/** Enabling 2FA answers a challenge; the same hook confirms it with the OTP. */
export const useToggle2fa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.toggle2fa,
    onSuccess: (result) => {
      if (!result.otpRequired) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      }
    },
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions }),
  });
};

export const useExportData = () =>
  useMutation({ mutationFn: usersApi.exportData });

export const useDeleteAccount = () =>
  useMutation({ mutationFn: usersApi.deleteMe });
