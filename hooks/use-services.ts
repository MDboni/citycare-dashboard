"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  paymentsApi,
  type ServiceRequestFilters,
  serviceRequestsApi,
} from "@/api";
import { queryKeys } from "./query-keys";

export const useMyServiceRequests = (filters: ServiceRequestFilters = {}) =>
  useQuery({
    queryKey: queryKeys.serviceRequests.mine(filters),
    queryFn: () => serviceRequestsApi.listMine(filters),
    placeholderData: (previous) => previous,
  });

export const useServiceRequest = (id: string) =>
  useQuery({
    queryKey: queryKeys.serviceRequests.detail(id),
    queryFn: () => serviceRequestsApi.getById(id),
    enabled: Boolean(id),
  });

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceRequestsApi.create,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequests.all,
      }),
  });
};

export const useUploadServiceDocument = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, label }: { file: File; label: string }) =>
      serviceRequestsApi.addDocument(id, file, label),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequests.detail(id),
      }),
  });
};

/**
 * Initiating a payment is a redirect, not a state change: the browser leaves for
 * the gateway, so there is nothing to invalidate on this side.
 */
export const useInitiatePayment = () =>
  useMutation({ mutationFn: paymentsApi.initiate });

export const useMyPayments = (page = 1, limit = 10) =>
  useQuery({
    queryKey: queryKeys.payments.mine(page, limit),
    queryFn: () => paymentsApi.listMine({ page, limit }),
    placeholderData: (previous) => previous,
  });

// ---------------------------------------------------------------------------
// staff-only: the officer and admin side of a service request
// ---------------------------------------------------------------------------

export const useServiceRequests = (filters: ServiceRequestFilters = {}) =>
  useQuery({
    queryKey: ["service-requests", "all", filters] as const,
    queryFn: () => serviceRequestsApi.list(filters),
    placeholderData: (previous) => previous,
  });

export const useUpdateServiceRequestStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      status: "PROCESSING" | "COMPLETED" | "REJECTED";
      note?: string;
    }) => serviceRequestsApi.updateStatus(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequests.all,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequests.detail(id),
      });
    },
  });
};

/**
 * A refund is two steps by design: an admin records the request, and only a
 * super admin approves it. The two hooks invalidate the same request detail,
 * because the refund shows up nested under its payment.
 */
export const useRequestRefund = (serviceRequestId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      reason,
    }: {
      paymentId: string;
      reason: string;
    }) => paymentsApi.requestRefund(paymentId, { reason }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequests.detail(serviceRequestId),
      }),
  });
};

export const useApproveRefund = (serviceRequestId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.approveRefund(paymentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.serviceRequests.detail(serviceRequestId),
      }),
  });
};
