"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { type PaymentLedgerFilters, paymentsApi } from "@/api";
import { adminKeys } from "./query-keys";

/**
 * The staff ledger. Both reads take the same filter object so the table and the
 * totals above it can never end up describing different sets of rows — the only
 * difference is that the summary drops `page`, `limit` and `status`, which it
 * reports on rather than filters by.
 */
export const usePaymentLedger = (filters: PaymentLedgerFilters = {}) =>
  useQuery({
    queryKey: adminKeys.paymentLedger(filters),
    queryFn: () => paymentsApi.ledger(filters),
    placeholderData: (previous) => previous,
  });

export const usePaymentSummary = (
  filters: Omit<PaymentLedgerFilters, "page" | "limit" | "status"> = {},
) =>
  useQuery({
    queryKey: adminKeys.paymentSummary(filters),
    queryFn: () => paymentsApi.summary(filters),
    placeholderData: (previous) => previous,
  });

export const useDownloadLedgerCsv = () =>
  useMutation({ mutationFn: paymentsApi.downloadLedgerCsv });
