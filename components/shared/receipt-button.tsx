"use client";

import { FileTextIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDownloadReceipt } from "@/hooks";

/**
 * Downloads one payment's receipt PDF.
 *
 * A plain `<a download>` cannot do this: the endpoint is authenticated with a
 * bearer token that only lives in JavaScript, so the bytes are fetched and
 * handed to a throwaway anchor. That also keeps the file off any public URL
 * that would still work for whoever found it later.
 *
 * Only a SUCCESS payment has a receipt at all, so the ledger decides whether to
 * render this; the button itself does not guess.
 */
export function ReceiptButton({
  paymentId,
  transactionId,
}: {
  paymentId: string;
  transactionId: string;
}) {
  const receipt = useDownloadReceipt();

  const download = async () => {
    try {
      const blob = await receipt.mutateAsync(paymentId);
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `CityCare-receipt-${transactionId}.pdf`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();

      // Revoked on a delay, not immediately: Safari reads the object URL after
      // the click returns, and pulling it out from under the download cancels it.
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "The receipt failed.",
      );
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={receipt.isPending}
      onClick={() => void download()}
      aria-label={`Download the receipt for ${transactionId}`}
    >
      {receipt.isPending ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <FileTextIcon data-icon="inline-start" />
      )}
      Receipt
    </Button>
  );
}
