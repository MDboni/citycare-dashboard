import { api } from "@/lib/api-client";
import type { Profile } from "@/types";

export const usersApi = {
  me: () => api<Profile>("/users/me"),

  updateMe: (body: { name?: string; phone?: string; wardId?: string }) =>
    api<Profile>("/users/me", { method: "PATCH", body }),

  /** multipart/form-data — the browser sets the boundary, so no headers here. */
  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api<Profile>("/users/me/avatar", { method: "PATCH", body: form });
  },

  /** Data portability: the whole account as one JSON document. */
  exportData: () => api<Record<string, unknown>>("/users/me/export"),

  deleteMe: () => api<{ message: string }>("/users/me", { method: "DELETE" }),
};
