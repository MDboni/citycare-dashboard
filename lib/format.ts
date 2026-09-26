import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

const toDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
};

export const formatDate = (value: string | Date | null | undefined) => {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy") : "—";
};

export const formatDateTime = (value: string | Date | null | undefined) => {
  const date = toDate(value);
  return date ? format(date, "d MMM yyyy, h:mm a") : "—";
};

export const formatRelative = (value: string | Date | null | undefined) => {
  const date = toDate(value);
  return date ? `${formatDistanceToNowStrict(date)} ago` : "—";
};

/** Fees arrive as decimal strings; they stay strings until the very last step. */
export const formatBdt = (amount: string | number | null | undefined) => {
  if (amount === null || amount === undefined || amount === "") return "—";
  const value = Number(amount);
  if (Number.isNaN(value)) return String(amount);
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US").format(value);

export const formatHours = (hours: number | null | undefined) => {
  if (hours === null || hours === undefined) return "—";
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
};

export const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/** Two letters for an avatar fallback: "Ayesha Rahman" becomes "AR". */
export const initials = (name: string | null | undefined) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
};

/** SUBMITTED -> Submitted, PENDING_PAYMENT -> Pending payment. */
export const humanise = (value: string | null | undefined) => {
  if (!value) return "—";
  const lower = value.toLowerCase().replace(/_/g, " ");
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

/**
 * The SLA clock as a single sentence. `null` means the complaint is already
 * finished, so nothing should be counting down.
 */
export const slaCountdown = (
  slaDueAt: string | null,
  resolvedAt: string | null,
): { label: string; overdue: boolean } | null => {
  const due = toDate(slaDueAt);
  if (!due || resolvedAt) return null;
  const overdue = due.getTime() < Date.now();
  return {
    label: overdue
      ? `${formatDistanceToNowStrict(due)} overdue`
      : `${formatDistanceToNowStrict(due)} left`,
    overdue,
  };
};

export const truncate = (value: string, max = 80) =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;
