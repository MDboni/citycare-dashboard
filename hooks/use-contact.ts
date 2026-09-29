"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ContactMessageFilters, contactApi } from "@/api";
import { adminKeys } from "./query-keys";

export const useContactMessages = (filters: ContactMessageFilters) =>
  useQuery({
    queryKey: adminKeys.contactMessages(filters),
    queryFn: () => contactApi.list(filters),
    // Keeps the table on screen while a page or a filter change is in flight,
    // so the rows do not collapse to a skeleton on every keystroke.
    placeholderData: (previous) => previous,
  });

export const useUpdateContactMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: { id: string } & Parameters<typeof contactApi.update>[1]) =>
      contactApi.update(id, body),
    // A status change moves the row between filtered views and shifts the NEW
    // counter in the envelope, so the whole list is refetched rather than one row.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminKeys.allContactMessages }),
  });
};
