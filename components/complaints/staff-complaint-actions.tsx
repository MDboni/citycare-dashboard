"use client";

import {
  CircleCheckBigIcon,
  Loader2Icon,
  SparklesIcon,
  UserCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminUsers,
  useAssignComplaint,
  useChangeComplaintStatus,
} from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { allowedTransitions, COMPLAINT_STATUS_META } from "@/lib/constants";
import type { ComplaintDetail, ComplaintStatus, Role } from "@/types";

/**
 * The staff side of a complaint.
 *
 * The buttons come from the same transition map the server enforces, filtered by
 * the caller's role, so the console never offers a move that would return a 409
 * INVALID_TRANSITION. Assignment is its own endpoint rather than a status change,
 * because picking the officer and moving to ASSIGNED happen together.
 */
export function StaffComplaintActions({
  complaint,
  role,
}: {
  complaint: ComplaintDetail;
  role: Role;
}) {
  const changeStatus = useChangeComplaintStatus(complaint.id);
  const assign = useAssignComplaint(complaint.id);

  const [pending, setPending] = useState<ComplaintStatus | null>(null);
  const [note, setNote] = useState("");
  const [assigning, setAssigning] = useState(false);

  const transitions = allowedTransitions(complaint.status, role);
  // ASSIGNED is reached through the assign endpoint, so it is not a plain move.
  const plainMoves = transitions.filter((status) => status !== "ASSIGNED");
  const canAssign = role === "ADMIN" && transitions.includes("ASSIGNED");

  const runStatusChange = async () => {
    if (!pending) return;
    const trimmed = note.trim();

    try {
      await changeStatus.mutateAsync({
        status: pending,
        ...(trimmed.length >= 2 ? { note: trimmed } : {}),
      });
      toast.success(`Moved to ${COMPLAINT_STATUS_META[pending].label}.`);
      setPending(null);
      setNote("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (!plainMoves.length && !canAssign) {
    return (
      <p className="text-sm text-muted-foreground">
        This complaint is{" "}
        {COMPLAINT_STATUS_META[complaint.status].label.toLowerCase()}; there is
        no move left for your role.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {canAssign && (
          <Button size="sm" onClick={() => setAssigning(true)}>
            <UserCheckIcon />
            {complaint.officer ? "Reassign" : "Assign an officer"}
          </Button>
        )}

        {plainMoves.map((status) => {
          const destructive = status === "REJECTED";
          const positive = status === "RESOLVED" || status === "CLOSED";

          return (
            <Button
              key={status}
              size="sm"
              variant={
                destructive ? "destructive" : positive ? "default" : "outline"
              }
              onClick={() => setPending(status)}
            >
              {destructive ? (
                <XCircleIcon />
              ) : positive ? (
                <CircleCheckBigIcon />
              ) : null}
              Move to {COMPLAINT_STATUS_META[status].label.toLowerCase()}
            </Button>
          );
        })}
      </div>

      {/* ------------------------------------------------- status change dialog */}
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
            <DialogTitle>
              Move to{" "}
              {pending
                ? COMPLAINT_STATUS_META[pending].label.toLowerCase()
                : ""}
              ?
            </DialogTitle>
            <DialogDescription>
              The change goes on the timeline with your name against it, and the
              citizen is notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="status-note">Note (optional)</FieldLabel>
            <Textarea
              id="status-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                pending === "REJECTED"
                  ? "Outside the municipality boundary — forwarded to the district office."
                  : pending === "RESOLVED"
                    ? "New fitting installed and tested. Proof attached."
                    : "Site visit scheduled for Thursday morning."
              }
            />
            <FieldDescription>
              The citizen can read this, so keep it plain. Internal detail
              belongs in an internal comment.
            </FieldDescription>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              disabled={changeStatus.isPending}
              onClick={() => void runStatusChange()}
            >
              {changeStatus.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignDialog
        open={assigning}
        onClose={() => setAssigning(false)}
        complaint={complaint}
        assign={assign}
      />
    </>
  );
}

/**
 * Assignment has two modes. `auto: true` lets the server pick the officer with
 * the lightest load in the right department, which is the right default; a named
 * officer is the override. The API refuses both at once, so the UI does too.
 */
function AssignDialog({
  open,
  onClose,
  complaint,
  assign,
}: {
  open: boolean;
  onClose: () => void;
  complaint: ComplaintDetail;
  assign: ReturnType<typeof useAssignComplaint>;
}) {
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [officerId, setOfficerId] = useState("");
  const [reason, setReason] = useState("");

  // Only fetched while the dialog is open — there is no reason to pull the
  // officer list on every complaint page view.
  const officers = useAdminUsers(
    open ? { role: "OFFICER", status: "ACTIVE", limit: 100 } : {},
  );

  const options = (officers.data?.items ?? []).map((officer) => ({
    value: officer.id,
    label: officer.name,
    hint: officer.department?.name,
  }));

  const submit = async () => {
    if (mode === "manual" && !officerId) {
      toast.error("Pick an officer, or switch to automatic.");
      return;
    }

    const trimmed = reason.trim();

    try {
      await assign.mutateAsync({
        ...(mode === "auto" ? { auto: true } : { officerId }),
        ...(trimmed.length >= 2 ? { reason: trimmed } : {}),
      });
      toast.success("Assigned. The officer has been notified.");
      onClose();
      setOfficerId("");
      setReason("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {complaint.officer
              ? "Reassign this complaint"
              : "Assign this complaint"}
          </DialogTitle>
          <DialogDescription>
            {complaint.officer
              ? `Currently with ${complaint.officer.name}.`
              : "It moves to assigned as soon as an officer takes it."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "auto" ? "default" : "outline"}
              onClick={() => setMode("auto")}
            >
              <SparklesIcon />
              Automatic
            </Button>
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
            >
              <UserCheckIcon />
              Choose
            </Button>
          </div>

          {mode === "auto" ? (
            <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              CityCare picks the officer in the owning department with the
              lightest open caseload. If the department has nobody active, the
              call fails rather than assigning to the wrong team.
            </p>
          ) : (
            <div className="space-y-1.5">
              <FieldLabel htmlFor="officer">Officer</FieldLabel>
              <Select
                items={options}
                value={officerId || null}
                onValueChange={(value) => setOfficerId(String(value ?? ""))}
              >
                <SelectTrigger id="officer" className="w-full">
                  <SelectValue
                    placeholder={
                      officers.isPending
                        ? "Loading officers…"
                        : "Pick an officer"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span>{option.label}</span>
                      {option.hint && (
                        <span className="text-xs text-muted-foreground">
                          {option.hint}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                An officer outside the category owning department will be
                refused by the API.
              </FieldDescription>
            </div>
          )}

          <div className="space-y-1.5">
            <FieldLabel htmlFor="assign-reason">Reason (optional)</FieldLabel>
            <Textarea
              id="assign-reason"
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Closest crew to the ward."
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button disabled={assign.isPending} onClick={() => void submit()}>
            {assign.isPending && <Loader2Icon className="animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
