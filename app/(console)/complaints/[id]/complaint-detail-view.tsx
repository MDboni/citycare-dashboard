"use client";

import { cn } from "cn";
import {
  ArrowLeftIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  ThumbsUpIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { ComplaintAttachments } from "@/components/complaints/complaint-attachments";
import { ComplaintComments } from "@/components/complaints/complaint-comments";
import { StaffComplaintActions } from "@/components/complaints/staff-complaint-actions";
import { StatusTimeline } from "@/components/complaints/status-timeline";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { DetailPageSkeleton } from "@/components/shared/loading";
import {
  ComplaintStatusPill,
  PriorityPill,
} from "@/components/shared/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useComplaint } from "@/hooks";
import { formatDateTime, slaCountdown } from "@/lib/format";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

export function ComplaintDetailView({ id }: { id: string }) {
  const { user } = useAuth();
  const {
    data: complaint,
    isPending,
    isError,
    error,
    refetch,
  } = useComplaint(id);

  if (isPending) return <DetailPageSkeleton />;

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
          title="Could not open this complaint"
        />
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={routes.complaints.list} />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Back to complaints
          </Button>
        </div>
      </div>
    );
  }

  const role = user?.role ?? "OFFICER";
  const sla = slaCountdown(complaint.slaDueAt, complaint.resolvedAt);

  const authorNames: Record<string, string> = {
    [complaint.citizen.id]: complaint.citizen.name,
    ...(complaint.officer
      ? { [complaint.officer.id]: complaint.officer.name }
      : {}),
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={routes.complaints.list} />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Complaints
      </Button>

      <div className="space-y-4 border-b border-border pb-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <ComplaintStatusPill status={complaint.status} />
          <PriorityPill priority={complaint.priority} />
          {complaint.isEscalated && (
            <Badge variant="destructive" className="gap-1">
              <TriangleAlertIcon aria-hidden />
              SLA breached
            </Badge>
          )}
          {complaint.reopenCount > 0 && (
            <Badge variant="outline">Reopened {complaint.reopenCount}×</Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="h-section">{complaint.title}</h1>
          <div className="flex items-center gap-1">
            <p className="font-mono text-sm text-muted-foreground">
              {complaint.trackingId}
            </p>
            <CopyButton
              value={complaint.trackingId}
              label="Tracking id copied"
            />
          </div>
        </div>

        <StaffComplaintActions complaint={complaint} role={role} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px] xl:items-start">
        <div className="space-y-7">
          <section className="space-y-2">
            <h2 className="h-card">What was reported</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {complaint.description}
            </p>
          </section>

          <ComplaintAttachments
            complaintId={complaint.id}
            attachments={complaint.attachments}
            canUpload
            role={role}
          />

          {complaint.feedback && (
            <section className="space-y-2">
              <h2 className="h-card">Citizen rating</h2>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <div
                    role="img"
                    aria-label={`${complaint.feedback.rating} out of 5`}
                    className="flex items-center gap-0.5"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <StarIcon
                        key={value}
                        aria-hidden
                        className={cn(
                          "size-4",
                          value <= (complaint.feedback?.rating ?? 0)
                            ? "fill-warning text-warning"
                            : "text-muted-foreground/40",
                        )}
                      />
                    ))}
                  </div>
                  {complaint.feedback.comment && (
                    <p className="text-sm text-muted-foreground">
                      {complaint.feedback.comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          <Separator />

          <ComplaintComments
            complaintId={complaint.id}
            comments={complaint.comments}
            currentUserId={user?.id ?? ""}
            role={role}
            authorNames={authorNames}
          />
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20">
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="h-card">Reported by</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="sr-only">Name</dt>
                  <dd className="font-medium">{complaint.citizen.name}</dd>
                </div>
                <div>
                  <dt className="sr-only">Email</dt>
                  <dd className="flex items-center gap-1.5">
                    <MailIcon
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <a
                      href={`mailto:${complaint.citizen.email}`}
                      className="truncate text-primary underline-offset-4 hover:underline"
                    >
                      {complaint.citizen.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Phone</dt>
                  <dd className="flex items-center gap-1.5">
                    <PhoneIcon
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    {complaint.citizen.phone ? (
                      <a
                        href={`tel:${complaint.citizen.phone}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {complaint.citizen.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        {/* The API blanks this for an officer who is not assigned. */}
                        Not shared with you
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="h-card">Details</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Category
                  </dt>
                  <dd className="mt-0.5">
                    {complaint.category.name}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {complaint.category.slaHours}h SLA
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Ward
                  </dt>
                  <dd className="mt-0.5">
                    Ward {complaint.ward.number} — {complaint.ward.name}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Location
                  </dt>
                  <dd className="mt-0.5 flex items-start gap-1.5">
                    <MapPinIcon
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span>{complaint.address}</span>
                  </dd>
                  {complaint.latitude != null &&
                    complaint.longitude != null && (
                      <dd className="mt-1 ml-5">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${complaint.latitude},${complaint.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-primary underline-offset-4 hover:underline"
                        >
                          Open in maps
                        </a>
                      </dd>
                    )}
                </div>

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Assigned to
                  </dt>
                  <dd className="mt-0.5">
                    {complaint.officer?.name ?? (
                      <span className="text-muted-foreground">
                        Not assigned
                      </span>
                    )}
                  </dd>
                </div>

                {sla && (
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      SLA
                    </dt>
                    <dd
                      className={cn(
                        "mt-0.5 flex items-center gap-1.5",
                        sla.overdue && "font-medium text-destructive",
                      )}
                    >
                      <ClockIcon className="size-3.5" aria-hidden />
                      {sla.label}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Upvotes
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1.5">
                    <ThumbsUpIcon
                      className="size-3.5 text-muted-foreground"
                      aria-hidden
                    />
                    {complaint.upvoteCount}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Reported
                  </dt>
                  <dd className="mt-0.5">
                    {formatDateTime(complaint.createdAt)}
                  </dd>
                </div>

                {complaint.resolvedAt && (
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Resolved
                    </dt>
                    <dd className="mt-0.5">
                      {formatDateTime(complaint.resolvedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="h-card">Timeline</h2>
              <StatusTimeline entries={complaint.history} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
