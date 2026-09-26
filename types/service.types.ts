import type {
  PaymentStatus,
  RefundStatus,
  ServiceRequestStatus,
} from "./enums.types";

/**
 * These shapes were read off the running API, not inferred from the Prisma
 * models — the services select narrow field sets, so a model-shaped type would
 * promise fields that never arrive. Where a field only appears on the detail
 * response it is marked optional here.
 */

/** The trimmed serviceType every service-request response embeds. */
export type ServiceTypeRef = {
  id: string;
  name: string;
  fee: string;
};

/**
 * A document row carries no URL. The files are Cloudinary "authenticated"
 * assets, so the URL has to be minted per request — see
 * `GET /service-requests/:id/documents/:docId`, which returns a link good for
 * ten minutes.
 */
export type ServiceRequestDocument = {
  id: string;
  label: string;
  createdAt: string;
};

/** What that endpoint answers with. */
export type SignedDocument = {
  url: string;
  expiresInSec: number;
  label: string;
};

/** A payment as embedded in a service-request detail response. */
export type ServiceRequestPayment = {
  id: string;
  transactionId: string;
  amount: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
};

export type ServiceRequest = {
  id: string;
  referenceNo: string;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
  serviceType: ServiceTypeRef;
  citizen?: { id: string; name: string; email: string };
  /** Detail response only. */
  citizenId?: string;
  serviceTypeId?: string;
  details?: Record<string, unknown> | null;
  processedById?: string | null;
  deletedAt?: string | null;
  documents?: ServiceRequestDocument[];
  payments?: ServiceRequestPayment[];
};

export type Refund = {
  id: string;
  paymentId: string;
  status: RefundStatus;
  reason: string;
  amount: string;
  requestedById: string | null;
  approvedById: string | null;
  createdAt: string;
  processedAt: string | null;
};

/** `GET /payments/my` — the row shape, which carries no service-request id. */
export type PaymentListItem = {
  id: string;
  transactionId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  serviceRequest: {
    referenceNo: string;
    serviceType: { name: string };
  } | null;
};

/** `GET /payments/:id` — the only place a refund is visible. */
export type Payment = {
  id: string;
  transactionId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  serviceRequest: { referenceNo: string; status: ServiceRequestStatus } | null;
  refund: Refund | null;
};

/** `POST /payments/initiate` — hand `paymentUrl` to the browser, nothing else. */
export type PaymentInitiation = {
  paymentId: string;
  transactionId: string;
  paymentUrl: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  /** Free-form payload, e.g. `{ complaintId, level }` on an SLA breach. */
  meta: Record<string, unknown> | null;
  createdAt: string;
};
