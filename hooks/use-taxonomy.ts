"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taxonomyApi } from "@/api-client";
import { queryKeys } from "./query-keys";

/**
 * Every taxonomy write invalidates its own public list. The server drops its
 * cache on the same write, so the next read is already fresh.
 */
const useTaxonomyMutation = <TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  queryKey: readonly unknown[],
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
};

export const useCreateDepartment = () =>
  useTaxonomyMutation(
    taxonomyApi.departments.create,
    queryKeys.catalog.departments,
  );

export const useUpdateDepartment = () =>
  useTaxonomyMutation(
    ({ id, ...body }: { id: string; name?: string; email?: string }) =>
      taxonomyApi.departments.update(id, body),
    queryKeys.catalog.departments,
  );

export const useDeleteDepartment = () =>
  useTaxonomyMutation(
    taxonomyApi.departments.remove,
    queryKeys.catalog.departments,
  );

export const useCreateCategory = () =>
  useTaxonomyMutation(
    taxonomyApi.categories.create,
    queryKeys.catalog.categories,
  );

export const useUpdateCategory = () =>
  useTaxonomyMutation(
    ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      departmentId?: string;
      slaHours?: number;
      defaultPriority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    }) => taxonomyApi.categories.update(id, body),
    queryKeys.catalog.categories,
  );

export const useDeleteCategory = () =>
  useTaxonomyMutation(
    taxonomyApi.categories.remove,
    queryKeys.catalog.categories,
  );

export const useCreateWard = () =>
  useTaxonomyMutation(taxonomyApi.wards.create, queryKeys.catalog.wards);

export const useUpdateWard = () =>
  useTaxonomyMutation(
    ({
      id,
      ...body
    }: {
      id: string;
      number?: number;
      name?: string;
      zoneId?: string;
    }) => taxonomyApi.wards.update(id, body),
    queryKeys.catalog.wards,
  );

export const useCreateZone = () =>
  useTaxonomyMutation(taxonomyApi.zones.create, queryKeys.catalog.zones);

export const useCreateServiceType = () =>
  useTaxonomyMutation(
    taxonomyApi.serviceTypes.create,
    queryKeys.catalog.serviceTypes,
  );

export const useUpdateServiceType = () =>
  useTaxonomyMutation(
    ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      fee?: string;
      isActive?: boolean;
    }) => taxonomyApi.serviceTypes.update(id, body),
    queryKeys.catalog.serviceTypes,
  );
