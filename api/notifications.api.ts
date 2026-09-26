import { apiList, apiRequest } from "@/lib/api-client";
import type { Notification } from "@/types";

export const notificationsApi = {
  list: (
    query: { page?: number; limit?: number; unread?: "true" | "false" } = {},
  ) => apiList<Notification>("/notifications", { query }),

  markRead: (id: string) =>
    apiRequest<null>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    apiRequest<{ updated: number }>("/notifications/read-all", {
      method: "PATCH",
    }),
};
