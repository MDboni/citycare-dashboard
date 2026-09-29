export type ContactMessageStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "SPAM";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  /** Optional: the sender may prefer a call back. */
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  /** Internal, never shown to the sender. */
  note: string | null;
  handledAt: string | null;
  handledBy: { id: string; name: string } | null;
  createdAt: string;
};
