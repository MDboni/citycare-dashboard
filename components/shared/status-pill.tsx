import { cn } from "cn";
import {
  COMPLAINT_STATUS_META,
  PAYMENT_STATUS_META,
  PRIORITY_META,
  ROLE_META,
  SERVICE_REQUEST_STATUS_META,
  USER_STATUS_META,
} from "@/lib/constants";
import type {
  ComplaintStatus,
  PaymentStatus,
  Priority,
  Role,
  ServiceRequestStatus,
  UserStatus,
} from "@/types";

/**
 * One chip shape for every enum in the system. The colour comes from the meta
 * tables in `lib/constants`, never from the call site, so a status cannot end up
 * green in a table and amber in a header.
 */
const pillBase =
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

type PillProps = { className?: string; withDot?: boolean };

const Pill = ({
  label,
  tone,
  accent,
  className,
  withDot,
}: { label: string; tone: string; accent: string } & PillProps) => (
  <span className={cn(pillBase, tone, className)}>
    {withDot && (
      <span
        className={cn("size-1.5 shrink-0 rounded-full", accent)}
        aria-hidden
      />
    )}
    {label}
  </span>
);

export const ComplaintStatusPill = ({
  status,
  ...rest
}: { status: ComplaintStatus } & PillProps) => (
  <Pill {...COMPLAINT_STATUS_META[status]} withDot {...rest} />
);

export const PriorityPill = ({
  priority,
  ...rest
}: { priority: Priority } & PillProps) => (
  <Pill {...PRIORITY_META[priority]} {...rest} />
);

export const ServiceRequestStatusPill = ({
  status,
  ...rest
}: { status: ServiceRequestStatus } & PillProps) => (
  <Pill {...SERVICE_REQUEST_STATUS_META[status]} withDot {...rest} />
);

export const PaymentStatusPill = ({
  status,
  ...rest
}: { status: PaymentStatus } & PillProps) => (
  <Pill {...PAYMENT_STATUS_META[status]} withDot {...rest} />
);

export const UserStatusPill = ({
  status,
  ...rest
}: { status: UserStatus } & PillProps) => (
  <Pill {...USER_STATUS_META[status]} withDot {...rest} />
);

export const RolePill = ({ role, ...rest }: { role: Role } & PillProps) => (
  <Pill {...ROLE_META[role]} {...rest} />
);
