import { api, apiList, apiRequest } from "@/lib/api-client";
import type { Payment, PaymentInitiation, PaymentListItem } from "@/types";

export const paymentsApi = {
  /**
   * Answers a gateway URL, never a card form. The browser leaves CityCare for
   * SSLCommerz and comes back to /payments/result.
   */
  initiate: (body: { serviceRequestId: string }) =>
    api<PaymentInitiation>("/payments/initiate", { method: "POST", body }),

  listMine: (query: { page?: number; limit?: number } = {}) =>
    apiList<PaymentListItem>("/payments/my", { query }),

  getById: (id: string) => api<Payment>(`/payments/${id}`),

  requestRefund: (id: string, body: { reason: string }) =>
    apiRequest<unknown>(`/payments/${id}/refund`, { method: "POST", body }),

  approveRefund: (id: string) =>
    apiRequest<unknown>(`/payments/${id}/refund/approve`, { method: "PATCH" }),
};
