"use client";

import { ExternalLinkIcon, FileIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { serviceRequestsApi } from "@/api-client";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import type { ServiceRequestDocument } from "@/types";

/**
 * Uploaded documents are Cloudinary "authenticated" assets, so a row carries no
 * URL — only `GET /service-requests/:id/documents/:docId` can mint one, and it
 * is good for ten minutes.
 *
 * That rules out rendering an `<a href>`: a link put in the page on load would
 * be dead by the time anyone clicked it. So each row is a button that asks for a
 * fresh URL and then opens it. The window is opened synchronously and its
 * location set afterwards, because a popup opened inside an await is the kind a
 * browser blocks.
 */
export function DocumentList({
  serviceRequestId,
  documents,
  emptyMessage = "Nothing attached yet.",
}: {
  serviceRequestId: string;
  documents: ServiceRequestDocument[];
  emptyMessage?: string;
}) {
  const [opening, setOpening] = useState<string | null>(null);

  const open = async (document: ServiceRequestDocument) => {
    setOpening(document.id);
    const tab = window.open("", "_blank", "noopener,noreferrer");

    try {
      const signed = await serviceRequestsApi.getDocument(
        serviceRequestId,
        document.id,
      );
      if (tab) tab.location.href = signed.url;
      else window.location.href = signed.url;
    } catch (error) {
      tab?.close();
      toast.error(errorMessage(error));
    } finally {
      setOpening(null);
    }
  };

  if (!documents.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {documents.map((document) => (
        <li key={document.id}>
          <button
            type="button"
            disabled={opening === document.id}
            onClick={() => void open(document)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <FileIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {document.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatDateTime(document.createdAt)}
                </span>
              </span>
            </span>

            {opening === document.id ? (
              <Loader2Icon
                className="size-3.5 shrink-0 animate-spin text-muted-foreground"
                aria-hidden
              />
            ) : (
              <ExternalLinkIcon
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
