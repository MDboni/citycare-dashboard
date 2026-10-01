"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api-client";
import { getAccessToken } from "@/lib/session";
import { queryKeys } from "./query-keys";

export const useNotifications = (page = 1, unreadOnly = false) =>
  useQuery({
    queryKey: queryKeys.notifications.list(page, unreadOnly),
    queryFn: () =>
      notificationsApi.list({
        page,
        limit: 20,
        ...(unreadOnly ? { unread: "true" as const } : {}),
      }),
    placeholderData: (previous) => previous,
  });

/**
 * Feeds the bell badge in the header. Polls once a minute rather than opening a
 * socket: the backend has no realtime channel, and a minute is well inside what
 * a complaint update is worth.
 *
 * The list endpoint puts `unreadCount` in its meta on every call, so this asks
 * for a single row and reads the counter off the envelope rather than paging
 * through anything.
 */
export const useUnreadCount = () => {
  const query = useQuery({
    queryKey: [...queryKeys.notifications.all, "unread-count"],
    queryFn: () => notificationsApi.list({ page: 1, limit: 1 }),
    enabled: typeof document !== "undefined" && Boolean(getAccessToken()),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  return { ...query, count: Number(query.data?.meta.unreadCount ?? 0) };
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
};
