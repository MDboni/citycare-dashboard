import { api, apiList } from "@/lib/api-client";
import type {
  ServiceRequest,
  ServiceRequestDocument,
  ServiceRequestStatus,
  SignedDocument,
} from "@/types";

export type ServiceRequestFilters = {
  page?: number;
  limit?: number;
  status?: ServiceRequestStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export const serviceRequestsApi = {
  create: (body: {
    serviceTypeId: string;
    details?: Record<string, unknown>;
  }) => api<ServiceRequest>("/service-requests", { method: "POST", body }),

  listMine: (query: ServiceRequestFilters = {}) =>
    apiList<ServiceRequest>("/service-requests/my", { query }),

  list: (query: ServiceRequestFilters = {}) =>
    apiList<ServiceRequest>("/service-requests", { query }),

  getById: (id: string) => api<ServiceRequest>(`/service-requests/${id}`),

  updateStatus: (
    id: string,
    body: {
      status: Extract<
        ServiceRequestStatus,
        "PROCESSING" | "COMPLETED" | "REJECTED"
      >;
      note?: string;
    },
  ) =>
    api<ServiceRequest>(`/service-requests/${id}/status`, {
      method: "PATCH",
      body,
    }),

  addDocument: (id: string, file: File, label: string) => {
    const form = new FormData();
    form.append("document", file);
    form.append("label", label);
    return api<ServiceRequestDocument>(`/service-requests/${id}/documents`, {
      method: "POST",
      body: form,
    });
  },

  /**
   * Mints a short-lived signed URL for one document. The link expires in ten
   * minutes, so it is fetched at the moment of the click rather than rendered
   * into the page and left to go stale.
   */
  getDocument: (id: string, docId: string) =>
    api<SignedDocument>(`/service-requests/${id}/documents/${docId}`),
};
