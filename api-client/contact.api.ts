import { apiList, apiRequest } from "@/lib/api-client";
import type { ContactMessage, ContactMessageStatus } from "@/types";

export type ContactMessageFilters = {
  page?: number;
  limit?: number;
  status?: ContactMessageStatus;
  q?: string;
};

export const contactApi = {
  list: (query: ContactMessageFilters = {}) =>
    apiList<ContactMessage>("/contact", { query }),

  update: (
    id: string,
    body: { status?: ContactMessageStatus; note?: string },
  ) => apiRequest<ContactMessage>(`/contact/${id}`, { method: "PATCH", body }),
};
