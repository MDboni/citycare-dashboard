"use client";

import {
  ArrowLeftIcon,
  CircleCheckBigIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentList } from "@/components/services/document-list";
import { RefundPanel } from "@/components/services/refund-panel";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { DetailPageSkeleton } from "@/components/shared/loading";
import { ServiceRequestStatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useServiceRequest, useUpdateServiceRequestStatus } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { formatBdt, formatDateTime, humanise } from "@/lib/format";
import { routes } from "@/routes";
import type { ServiceRequestStatus } from "@/types";

/** The only three statuses `PATCH /service-requests/:id/status` accepts. */
const MOVES: {
  status: Extract<
    ServiceRequestStatus,
    "PROCESSING" | "COMPLETED" | "REJECTED"
  >;
  label: string;
  from: ServiceRequestStatus[];
}[] = [
  { status: "PROCESSING", label: "Start processing", from: ["PAID"] },
  { status: "COMPLETED", label: "Mark completed", from: ["PROCESSING"] },
  { status: "REJECTED", label: "Reject", from: ["PAID", "PROCESSING"] },
];

export function RequestDetailView({ id }: { id: string }) {
  const {
    data: request,
    isPending,
    isError,
    error,
    refetch,
  } = useServiceRequest(id);
  const updateStatus = useUpdateServiceRequestStatus(id);

  const [pending, setPending] = useState<(typeof MOVES)[number] | null>(null);
  const [note, setNote] = useState("");

  if (isPending) return <DetailPageSkeleton />;

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Could not open this application"
        />
      </div>
    );
  }

  const payments = request.payments ?? [];
  const documents = request.documents ?? [];
  const details = request.details ?? null;
  const available = MOVES.filter((move) => move.from.includes(request.status));

  const runStatusChange = async () => {
    if (!pending) return;
    const trimmed = note.trim();

    try {
      await updateStatus.mutateAsync({
        status: pending.status,
        ...(trimmed ? { note: trimmed } : {}),
      });
      toast.success(`Moved to ${humanise(pending.status).toLowerCase()}.`);
      setPending(null);
      setNote("");
    } catch (caught) {
      toast.error(errorMessage(caught));
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={routes.serviceRequests.list} />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Service requests
      </Button>

      <div className="space-y-4 border-b border-border pb-5">
        <ServiceRequestStatusPill status={request.status} />

        <div className="space-y-1.5">
          <h1 className="h-section">{request.serviceType.name}</h1>
          <div className="flex items-center gap-1">
            <p className="font-mono text-sm text-muted-foreground">
              {request.referenceNo}
            </p>
            <CopyButton value={request.referenceNo} label="Reference copied" />
          </div>
        </div>

        {available.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {available.map((move) => (
              <Button
                key={move.status}
                size="sm"
                variant={
                  move.status === "REJECTED"
                    ? "destructive"
                    : move.status === "COMPLETED"
                      ? "default"
                      : "outline"
                }
                onClick={() => setPending(move)}
              >
                {move.status === "REJECTED" ? (
                  <XCircleIcon />
                ) : move.status === "COMPLETED" ? (
                  <CircleCheckBigIcon />
                ) : null}
                {move.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {request.status === "PENDING_PAYMENT"
              ? "Waiting on the applicant to pay the fee. Nothing to do here yet."
              : "This application is closed."}
          </p>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px] xl:items-start">
        <div className="space-y-4">
          {details && Object.keys(details).length > 0 && (
            <Card>
              <CardContent className="space-y-3 p-5">
                <h2 className="h-card">Details from the applicant</h2>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(details).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-border p-2.5"
                    >
                      <dt className="text-xs text-muted-foreground">{key}</dt>
                      <dd className="mt-0.5 text-sm break-words">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="h-card">Supporting documents</h2>
              <DocumentList
                serviceRequestId={request.id}
                documents={documents}
                emptyMessage="The applicant has not attached anything."
              />
              <p className="text-xs text-muted-foreground">
                Opening one mints a link that expires in ten minutes, so the
                file cannot be passed on by copying its address.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="h-card">Payments</h2>

              {payments.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  No payment has been attempted.
                </p>
              ) : (
                <ul className="space-y-2">
                  {payments.map((payment) => (
                    <RefundPanel
                      key={payment.id}
                      payment={payment}
                      serviceRequestId={request.id}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="h-card">Applicant</h2>
              {request.citizen ? (
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="sr-only">Name</dt>
                    <dd className="font-medium">{request.citizen.name}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${request.citizen.email}`}
                        className="break-all text-primary underline-offset-4 hover:underline"
                      >
                        {request.citizen.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Applicant details are not included on this response.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="h-card">Application</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Fee
                  </dt>
                  <dd className="mt-0.5">
                    {formatBdt(request.serviceType.fee)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Applied
                  </dt>
                  <dd className="mt-0.5">
                    {formatDateTime(request.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Last updated
                  </dt>
                  <dd className="mt-0.5">
                    {formatDateTime(request.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPending(null);
            setNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{pending?.label}?</DialogTitle>
            <DialogDescription>
              The applicant is notified, and the note below goes into that
              notification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="sr-note">Note (optional)</FieldLabel>
            <Textarea
              id="sr-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                pending?.status === "REJECTED"
                  ? "The trade licence copy is illegible. Reapply with a clear scan."
                  : "Collect the certificate from window 4 with your reference number."
              }
            />
            <FieldDescription>Up to 500 characters.</FieldDescription>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              variant={
                pending?.status === "REJECTED" ? "destructive" : "default"
              }
              disabled={updateStatus.isPending}
              onClick={() => void runStatusChange()}
            >
              {updateStatus.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
