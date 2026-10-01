"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, UndoDotIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { paymentsApi } from "@/api-client";
import { CopyButton } from "@/components/shared/copy-button";
import { PaymentStatusPill } from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useApproveRefund, useRequestRefund } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { formatBdt, formatDateTime, humanise } from "@/lib/format";
import { useAuth } from "@/providers";
import type { ServiceRequestPayment } from "@/types";

/**
 * One payment, plus whatever refund sits against it.
 *
 * The refund is the reason this is its own component: the payment rows embedded
 * in a service-request response do not include one, and only `GET /payments/:id`
 * does. So each successful payment fetches its own detail to find out whether a
 * refund has already been asked for — without that, the console would offer to
 * open a second refund on a payment that already had one.
 */
export function RefundPanel({
  payment,
  serviceRequestId,
}: {
  payment: ServiceRequestPayment;
  serviceRequestId: string;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const requestRefund = useRequestRefund(serviceRequestId);
  const approveRefund = useApproveRefund(serviceRequestId);

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  // Only a settled payment can be refunded, so only those are worth a lookup.
  const detail = useQuery({
    queryKey: ["payments", "detail", payment.id],
    queryFn: () => paymentsApi.getById(payment.id),
    enabled: isAdmin && payment.status === "SUCCESS",
    staleTime: 30 * 1000,
  });

  const refund = detail.data?.refund ?? null;

  const submit = async () => {
    if (reason.trim().length < 5) {
      toast.error("Give a reason of at least 5 characters.");
      return;
    }

    try {
      await requestRefund.mutateAsync({
        paymentId: payment.id,
        reason: reason.trim(),
      });
      await detail.refetch();
      toast.success("Refund recorded. A super admin has to approve it.");
      setOpen(false);
      setReason("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <li className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1 font-mono text-xs break-all">
            {payment.transactionId}
            <CopyButton
              value={payment.transactionId}
              label="Transaction id copied"
            />
          </p>
          <p className="text-xs text-muted-foreground">
            {payment.paidAt
              ? `Paid ${formatDateTime(payment.paidAt)}`
              : `Started ${formatDateTime(payment.createdAt)}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tabular-nums">
            {formatBdt(payment.amount)}
          </span>
          <PaymentStatusPill status={payment.status} />
        </div>
      </div>

      {refund ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-2.5 py-2">
          <div className="min-w-0 text-xs">
            <p className="font-medium">
              Refund {humanise(refund.status).toLowerCase()} ·{" "}
              {formatBdt(refund.amount)}
            </p>
            <p className="text-muted-foreground">{refund.reason}</p>
          </div>

          {refund.status === "REQUESTED" &&
            (user?.isSuperAdmin ? (
              <Button
                size="xs"
                disabled={approveRefund.isPending}
                onClick={async () => {
                  try {
                    await approveRefund.mutateAsync(payment.id);
                    await detail.refetch();
                    toast.success("Refund approved.");
                  } catch (error) {
                    toast.error(errorMessage(error));
                  }
                }}
              >
                {approveRefund.isPending && (
                  <Loader2Icon className="animate-spin" />
                )}
                Approve
              </Button>
            ) : (
              <Badge variant="outline">Needs a super admin</Badge>
            ))}
        </div>
      ) : (
        isAdmin &&
        payment.status === "SUCCESS" &&
        !detail.isPending && (
          <Button variant="outline" size="xs" onClick={() => setOpen(true)}>
            <UndoDotIcon />
            Request a refund
          </Button>
        )
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setReason("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request a refund</DialogTitle>
            <DialogDescription>
              This records the request against the payment. A super admin has to
              approve it before any money moves.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <FieldLabel htmlFor={`refund-${payment.id}`}>Reason</FieldLabel>
            <Textarea
              id={`refund-${payment.id}`}
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Duplicate payment — the applicant was charged twice for the same reference."
            />
            <FieldDescription>Between 5 and 500 characters.</FieldDescription>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              disabled={requestRefund.isPending}
              onClick={() => void submit()}
            >
              {requestRefund.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Record refund request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
