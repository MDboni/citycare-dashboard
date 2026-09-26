import type { AttachmentKind, ComplaintStatus, Priority } from "./enums.types";

export type CategoryRef = { id: string; name: string };
export type WardRef = { id: string; number: number; name: string };

/** A row in any complaint list — the server's LIST_SELECT, field for field. */
export type ComplaintListItem = {
  id: string;
  trackingId: string;
  title: string;
  status: ComplaintStatus;
  priority: Priority;
  address: string;
  isEscalated: boolean;
  upvoteCount: number;
  slaDueAt: string | null;
  createdAt: string;
  resolvedAt: string | null;
  category: CategoryRef;
  ward: WardRef;
  officer: { id: string; name: string } | null;
};

export type ComplaintAttachment = {
  id: string;
  complaintId: string;
  url: string;
  publicId: string | null;
  kind: AttachmentKind;
  uploadedById: string | null;
  createdAt: string;
};

export type ComplaintComment = {
  id: string;
  complaintId: string;
  authorId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
};

export type ComplaintHistoryEntry = {
  id: string;
  complaintId: string;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  note: string | null;
  changedById: string | null;
  createdAt: string;
};

export type ComplaintFeedback = {
  id: string;
  complaintId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

/** `GET /complaints/:id` — DETAIL_INCLUDE plus the role-filtered comments. */
export type ComplaintDetail = {
  id: string;
  trackingId: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: Priority;
  address: string;
  latitude: number | null;
  longitude: number | null;
  isEscalated: boolean;
  upvoteCount: number;
  reopenCount: number;
  slaDueAt: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  category: CategoryRef & { slaHours: number; departmentId: string };
  ward: WardRef;
  citizen: { id: string; name: string; email: string; phone: string | null };
  officer: { id: string; name: string; email: string } | null;
  attachments: ComplaintAttachment[];
  feedback: ComplaintFeedback | null;
  history: ComplaintHistoryEntry[];
  comments: ComplaintComment[];
  /** Only present on the create response. */
  possibleDuplicate?: { id: string; trackingId: string; title: string } | null;
};

/** `GET /complaints/track/:trackingId` — public, so no names and no address. */
export type ComplaintTracking = {
  trackingId: string;
  status: ComplaintStatus;
  priority: Priority;
  isEscalated: boolean;
  createdAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  category: { name: string };
  ward: { number: number; name: string };
  history: {
    fromStatus: ComplaintStatus | null;
    toStatus: ComplaintStatus;
    createdAt: string;
  }[];
};

export type NearbyComplaint = ComplaintListItem & { distanceKm?: number };
