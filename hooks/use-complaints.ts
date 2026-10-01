"use client";

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { type ComplaintFilters, complaintsApi } from "@/api-client";
import type { AttachmentKind, ComplaintStatus } from "@/types";
import { queryKeys } from "./query-keys";

export const useMyComplaints = (filters: ComplaintFilters = {}) =>
  useQuery({
    queryKey: queryKeys.complaints.mine(filters),
    queryFn: () => complaintsApi.listMine(filters),
    placeholderData: (previous) => previous,
  });

export const useComplaints = (filters: ComplaintFilters = {}) =>
  useQuery({
    queryKey: queryKeys.complaints.list(filters),
    queryFn: () => complaintsApi.list(filters),
    placeholderData: (previous) => previous,
  });

export const useAssignedComplaints = (filters: ComplaintFilters = {}) =>
  useQuery({
    queryKey: queryKeys.complaints.assigned(filters),
    queryFn: () => complaintsApi.listAssigned(filters),
    placeholderData: (previous) => previous,
  });

export const useComplaint = (
  id: string,
  options?: Partial<
    UseQueryOptions<Awaited<ReturnType<typeof complaintsApi.getById>>>
  >,
) =>
  useQuery({
    queryKey: queryKeys.complaints.detail(id),
    queryFn: () => complaintsApi.getById(id),
    enabled: Boolean(id),
    ...options,
  });

/** Public tracking. Kept out of the auth path so a stranger can use it. */
export const useComplaintTracking = (trackingId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.complaints.tracking(trackingId),
    queryFn: () => complaintsApi.track(trackingId),
    enabled: enabled && Boolean(trackingId),
    retry: false,
  });

export const useNearbyComplaints = (
  coords: { lat: number; lng: number; radiusKm: number } | null,
) =>
  useQuery({
    queryKey: queryKeys.complaints.nearby(
      coords?.lat ?? 0,
      coords?.lng ?? 0,
      coords?.radiusKm ?? 0,
    ),
    queryFn: () =>
      complaintsApi.nearby({
        lat: coords?.lat ?? 0,
        lng: coords?.lng ?? 0,
        radiusKm: coords?.radiusKm,
        limit: 50,
      }),
    enabled: Boolean(coords),
  });

/**
 * Anything that changes a complaint invalidates both the lists and that one
 * detail, since a status change moves the row between filtered views.
 */
const useComplaintMutation = <TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  complaintId?: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.complaints.all,
      });
      if (complaintId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.complaints.detail(complaintId),
        });
      }
    },
  });
};

export const useCreateComplaint = () =>
  useComplaintMutation(complaintsApi.create);

export const useUpdateComplaint = (id: string) =>
  useComplaintMutation(
    (body: { title?: string; description?: string; address?: string }) =>
      complaintsApi.update(id, body),
    id,
  );

export const useChangeComplaintStatus = (id: string) =>
  useComplaintMutation(
    (body: { status: ComplaintStatus; note?: string }) =>
      complaintsApi.changeStatus(id, body),
    id,
  );

export const useAssignComplaint = (id: string) =>
  useComplaintMutation(
    (body: { officerId?: string; auto?: boolean; reason?: string }) =>
      complaintsApi.assign(id, body),
    id,
  );

export const useCancelComplaint = (id: string) =>
  useComplaintMutation(
    (body: { note?: string }) => complaintsApi.cancel(id, body),
    id,
  );

export const useReopenComplaint = (id: string) =>
  useComplaintMutation(
    (body: { note?: string }) => complaintsApi.reopen(id, body),
    id,
  );

export const useUpvoteComplaint = (id: string) =>
  useComplaintMutation(() => complaintsApi.upvote(id), id);

export const useComplaintFeedback = (id: string) =>
  useComplaintMutation(
    (body: { rating: number; comment?: string }) =>
      complaintsApi.feedback(id, body),
    id,
  );

export const useAddComplaintComment = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { body: string; isInternal?: boolean }) =>
      complaintsApi.addComment(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.complaints.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.complaints.comments(id),
      });
    },
  });
};

export const useAddComplaintAttachment = (id: string) =>
  useComplaintMutation(
    ({ file, kind }: { file: File; kind?: AttachmentKind }) =>
      complaintsApi.addAttachment(id, file, kind),
    id,
  );
