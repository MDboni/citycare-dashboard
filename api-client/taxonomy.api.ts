import { api, apiRequest } from "@/lib/api-client";
import type {
  Category,
  Department,
  Priority,
  ServiceType,
  Ward,
  Zone,
} from "@/types";

/**
 * The write half of the taxonomy. Reads live in `catalog.api.ts` because they
 * are public and cached; everything here is ADMIN only and invalidates that
 * cache server-side.
 */
export const taxonomyApi = {
  departments: {
    create: (body: { name: string; email?: string }) =>
      api<Department>("/departments", { method: "POST", body }),
    update: (id: string, body: { name?: string; email?: string }) =>
      api<Department>(`/departments/${id}`, { method: "PATCH", body }),
    remove: (id: string) =>
      apiRequest<unknown>(`/departments/${id}`, { method: "DELETE" }),
  },

  categories: {
    create: (body: {
      name: string;
      departmentId: string;
      slaHours: number;
      defaultPriority: Priority;
    }) => api<Category>("/categories", { method: "POST", body }),
    update: (
      id: string,
      body: {
        name?: string;
        departmentId?: string;
        slaHours?: number;
        defaultPriority?: Priority;
      },
    ) => api<Category>(`/categories/${id}`, { method: "PATCH", body }),
    remove: (id: string) =>
      apiRequest<unknown>(`/categories/${id}`, { method: "DELETE" }),
  },

  wards: {
    create: (body: { number: number; name: string; zoneId?: string }) =>
      api<Ward>("/wards", { method: "POST", body }),
    update: (
      id: string,
      body: { number?: number; name?: string; zoneId?: string },
    ) => api<Ward>(`/wards/${id}`, { method: "PATCH", body }),
  },

  zones: {
    create: (body: { name: string }) =>
      api<Zone>("/zones", { method: "POST", body }),
  },

  serviceTypes: {
    create: (body: { name: string; fee: string; isActive: boolean }) =>
      api<ServiceType>("/service-types", { method: "POST", body }),
    update: (
      id: string,
      body: { name?: string; fee?: string; isActive?: boolean },
    ) => api<ServiceType>(`/service-types/${id}`, { method: "PATCH", body }),
  },
};
