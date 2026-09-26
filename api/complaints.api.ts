import { api, apiList, apiRequest, type QueryParams } from "@/lib/api-client";
import type {
  AttachmentKind,
  ComplaintComment,
  ComplaintDetail,
  ComplaintHistoryEntry,
  ComplaintListItem,
  ComplaintStatus,
  ComplaintTracking,
  NearbyComplaint,
  Priority,
} from "@/types";

export type ComplaintFilters = QueryParams & {
  page?: number;
  limit?: number;
  status?: ComplaintStatus | string;
  priority?: Priority;
  wardId?: string;
  categoryId?: string;
  officerId?: string;
  isEscalated?: "true" | "false";
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  q?: string;
};

export const complaintsApi = {
  /** Public: status and timeline only, no personal data. */
  track: (trackingId: string) =>
    api<ComplaintTracking>(`/complaints/track/${trackingId}`, {
      anonymous: true,
    }),

  create: (body: {
    title: string;
    description: string;
    categoryId: string;
    wardId: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }) => api<ComplaintDetail>("/complaints", { method: "POST", body }),

  /** ADMIN and OFFICER. An officer only ever sees their own department. */
  list: (query: ComplaintFilters = {}) =>
    apiList<ComplaintListItem>("/complaints", { query }),

  listMine: (query: ComplaintFilters = {}) =>
    apiList<ComplaintListItem>("/complaints/my", { query }),

  listAssigned: (query: ComplaintFilters = {}) =>
    apiList<ComplaintListItem>("/complaints/my-assigned", { query }),

  search: (query: { q: string; page?: number; limit?: number }) =>
    apiList<ComplaintListItem>("/complaints/search", { query }),

  nearby: (query: {
    lat: number;
    lng: number;
    radiusKm?: number;
    limit?: number;
  }) => api<NearbyComplaint[]>("/complaints/nearby", { query }),

  getById: (id: string) => api<ComplaintDetail>(`/complaints/${id}`),

  update: (
    id: string,
    body: { title?: string; description?: string; address?: string },
  ) => api<ComplaintDetail>(`/complaints/${id}`, { method: "PATCH", body }),

  remove: (id: string) =>
    apiRequest<null>(`/complaints/${id}`, { method: "DELETE" }),

  /** The server's transition map decides whether the move is legal. */
  changeStatus: (
    id: string,
    body: { status: ComplaintStatus; note?: string },
  ) =>
    api<ComplaintDetail>(`/complaints/${id}/status`, {
      method: "PATCH",
      body,
    }),

  assign: (
    id: string,
    body: { officerId?: string; auto?: boolean; reason?: string },
  ) =>
    api<ComplaintDetail>(`/complaints/${id}/assign`, { method: "POST", body }),

  cancel: (id: string, body: { note?: string } = {}) =>
    api<ComplaintDetail>(`/complaints/${id}/cancel`, { method: "POST", body }),

  reopen: (id: string, body: { note?: string } = {}) =>
    api<ComplaintDetail>(`/complaints/${id}/reopen`, { method: "POST", body }),

  history: (id: string) =>
    api<ComplaintHistoryEntry[]>(`/complaints/${id}/history`),

  addAttachment: (id: string, file: File, kind?: AttachmentKind) => {
    const form = new FormData();
    form.append("file", file);
    if (kind) form.append("kind", kind);
    return api<ComplaintDetail>(`/complaints/${id}/attachments`, {
      method: "POST",
      body: form,
    });
  },

  comments: (id: string) =>
    api<ComplaintComment[]>(`/complaints/${id}/comments`),

  addComment: (id: string, body: { body: string; isInternal?: boolean }) =>
    api<ComplaintComment>(`/complaints/${id}/comments`, {
      method: "POST",
      body,
    }),

  /** Ten upvotes bump the priority one step, capped at URGENT. */
  upvote: (id: string) =>
    api<{ upvoteCount: number; priority: Priority }>(
      `/complaints/${id}/upvote`,
      { method: "POST" },
    ),

  feedback: (id: string, body: { rating: number; comment?: string }) =>
    api<{ rating: number; comment: string | null }>(
      `/complaints/${id}/feedback`,
      { method: "POST", body },
    ),
};
