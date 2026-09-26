"use client";

import { BadgeCheckIcon, ExternalLinkIcon, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { FilePicker } from "@/components/shared/file-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddComplaintAttachment } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import {
  IMAGE_MIME_TYPES,
  MAX_ATTACHMENTS,
  MAX_FILE_SIZE,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { ComplaintAttachment, Role } from "@/types";

/**
 * Evidence and resolution proof in one grid, labelled so the difference is
 * visible. An officer uploads proof; a citizen uploads evidence. The server
 * decides which kinds a role may send, so the picker only offers the right one.
 */
export function ComplaintAttachments({
  complaintId,
  attachments,
  canUpload,
  role,
}: {
  complaintId: string;
  attachments: ComplaintAttachment[];
  canUpload: boolean;
  role: Role;
}) {
  const upload = useAddComplaintAttachment(complaintId);
  const [open, setOpen] = useState(false);

  const kind = role === "OFFICER" ? "RESOLUTION_PROOF" : "EVIDENCE";
  const full = attachments.length >= MAX_ATTACHMENTS;

  const attach = async (file: File) => {
    try {
      await upload.mutateAsync({ file, kind });
      toast.success(
        kind === "RESOLUTION_PROOF" ? "Proof attached." : "Photo attached.",
      );
      setOpen(false);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="h-card">
          Photos
          {attachments.length > 0 && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {attachments.length}/{MAX_ATTACHMENTS}
            </span>
          )}
        </h2>

        {canUpload && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={<Button variant="outline" size="sm" disabled={full} />}
            >
              <ImageIcon />
              {kind === "RESOLUTION_PROOF" ? "Add proof" : "Add a photo"}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {kind === "RESOLUTION_PROOF"
                    ? "Attach resolution proof"
                    : "Attach a photo"}
                </DialogTitle>
              </DialogHeader>
              <FilePicker
                accept={IMAGE_MIME_TYPES}
                maxSize={MAX_FILE_SIZE}
                disabled={upload.isPending}
                onSelect={(file) => void attach(file)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-6 text-center text-sm text-muted-foreground">
          No photos on this complaint yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-lg border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <div className="relative aspect-4/3 bg-muted">
                  {/* Cloudinary is allow-listed in next.config.ts, so these go
                      through the optimiser. `sizes` matches the 2/3 column grid
                      below, which keeps a phone from downloading a desktop crop. */}
                  <Image
                    src={attachment.url}
                    alt={
                      attachment.kind === "RESOLUTION_PROOF"
                        ? "Resolution proof"
                        : "Reported issue"
                    }
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-md bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    <ExternalLinkIcon className="size-3.5" />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                  {attachment.kind === "RESOLUTION_PROOF" ? (
                    <Badge variant="secondary" className="gap-1">
                      <BadgeCheckIcon aria-hidden />
                      Proof
                    </Badge>
                  ) : (
                    <Badge variant="outline">Evidence</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(attachment.createdAt)}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
