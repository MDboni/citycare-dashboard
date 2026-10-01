import { api, apiList, apiRequest, BASE_URL } from "@/lib/api-client";
import { getAccessToken } from "@/lib/session";
import type {
  Payment,
  PaymentInitiation,
  PaymentLedgerRow,
  PaymentListItem,
  PaymentStatus,
  PaymentSummary,
} from "@/types";

/**
 * One filter shape for the three ledger endpoints, because the table, the
 * totals and the export have to be reading the same books. `status` is left out
 * of the summary call by the hook, not by a second type.
 */
export type PaymentLedgerFilters = {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  serviceTypeId?: string;
  from?: string;
  to?: string;
  q?: string;
};

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

  // --- the ledger (ADMIN + payments__view_all) -----------------------------

  ledger: (query: PaymentLedgerFilters = {}) =>
    apiList<PaymentLedgerRow>("/payments/admin", { query }),

  summary: (
    query: Omit<PaymentLedgerFilters, "page" | "limit" | "status"> = {},
  ) => api<PaymentSummary>("/payments/admin/summary", { query }),

  /**
   * The reconciliation file. It streams a CSV rather than an envelope, so it
   * cannot go through the usual client — and it still needs the bearer token,
   * which rules out a plain `<a download>`.
   */
  downloadLedgerCsv: async (filters: PaymentLedgerFilters = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, String(value));
    }

    const query = params.toString();
    const response = await fetch(
      `${BASE_URL}/payments/admin/ledger.csv${query ? `?${query}` : ""}`,
      {
        headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Your session expired. Sign in again and retry the export."
          : `The export failed with status ${response.status}.`,
      );
    }

    return response.blob();
  },

  /**
   * The payer's receipt, rebuilt by the server on demand. Same shape of problem
   * as the CSV above — it streams a PDF rather than an envelope and still needs
   * the bearer token — so it takes the same route around the usual client.
   *
   * Only a SUCCESS payment has one, and only an ADMIN may read somebody else's:
   * staff holding `payments__view_all` without the admin role can see the row
   * and will be refused the file, which is why the 403 gets its own sentence.
   */
  receipt: async (id: string) => {
    const response = await fetch(`${BASE_URL}/payments/${id}/receipt`, {
      headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
      credentials: "include",
    });

    if (!response.ok) {
      const reason =
        response.status === 401
          ? "Your session expired. Sign in again and retry."
          : response.status === 403
            ? "Only an admin can download another person's receipt."
            : response.status === 409
              ? "Only a completed payment has a receipt."
              : `The receipt failed with status ${response.status}.`;
      throw new Error(reason);
    }

    return response.blob();
  },
};
