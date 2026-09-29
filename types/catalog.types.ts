import type { Priority } from "./enums.types";

export type Department = {
  id: string;
  name: string;
  /** The escalation inbox for a breached complaint. */
  email: string | null;
  /** Published on the public contact page. Both optional. */
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  departmentId: string;
  slaHours: number;
  defaultPriority: Priority;
  createdAt: string;
  updatedAt: string;
  department?: { id: string; name: string };
};

export type Zone = {
  id: string;
  name: string;
  createdAt: string;
};

export type Ward = {
  id: string;
  number: number;
  name: string;
  zoneId: string | null;
  createdAt: string;
  zone?: { id: string; name: string } | null;
};

/** `fee` is a string end to end — a municipal fee never becomes a float. */
export type ServiceType = {
  id: string;
  name: string;
  fee: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
