import { api } from "@/lib/api-client";
import type { Category, Department, ServiceType, Ward, Zone } from "@/types";

/**
 * The taxonomy endpoints are public and cached server-side, so these are the
 * cheapest calls in the app and are safe to prefetch on the marketing pages.
 */
export const catalogApi = {
  departments: () => api<Department[]>("/departments", { anonymous: true }),
  categories: () => api<Category[]>("/categories", { anonymous: true }),
  wards: () => api<Ward[]>("/wards", { anonymous: true }),
  zones: () => api<Zone[]>("/zones", { anonymous: true }),
  serviceTypes: () => api<ServiceType[]>("/service-types", { anonymous: true }),
};
