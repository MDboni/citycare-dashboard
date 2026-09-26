"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/api";
import { queryKeys } from "./query-keys";

/** The taxonomy barely changes, so it is cached for an hour rather than a minute. */
const CATALOG_OPTIONS = {
  staleTime: 60 * 60 * 1000,
  gcTime: 2 * 60 * 60 * 1000,
} as const;

export const useDepartments = () =>
  useQuery({
    queryKey: queryKeys.catalog.departments,
    queryFn: catalogApi.departments,
    ...CATALOG_OPTIONS,
  });

export const useCategories = () =>
  useQuery({
    queryKey: queryKeys.catalog.categories,
    queryFn: catalogApi.categories,
    ...CATALOG_OPTIONS,
  });

export const useWards = () =>
  useQuery({
    queryKey: queryKeys.catalog.wards,
    queryFn: catalogApi.wards,
    ...CATALOG_OPTIONS,
  });

export const useZones = () =>
  useQuery({
    queryKey: queryKeys.catalog.zones,
    queryFn: catalogApi.zones,
    ...CATALOG_OPTIONS,
  });

export const useServiceTypes = () =>
  useQuery({
    queryKey: queryKeys.catalog.serviceTypes,
    queryFn: catalogApi.serviceTypes,
    ...CATALOG_OPTIONS,
  });
