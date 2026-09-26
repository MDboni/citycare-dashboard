"use client";

import { cn } from "cn";
import { FileIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/format";

/**
 * A drop zone that rejects the wrong file before it reaches the network.
 *
 * The server does the real check: it reads the magic bytes, so a renamed
 * executable is a 400 no matter what the browser claimed. This is only here to
 * save a round trip, and its limits are copied from middlewares/upload.ts.
 */
export function FilePicker({
  accept,
  maxSize,
  onSelect,
  disabled,
  hint,
  className,
}: {
  accept: string[];
  maxSize: number;
  onSelect: (file: File) => void;
  disabled?: boolean;
  hint?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<File | null>(null);

  const extensions = accept
    .map((mime) => mime.split("/")[1]?.toUpperCase())
    .filter(Boolean)
    .join(", ");

  const handle = (file: File | undefined) => {
    if (!file) return;

    if (!accept.includes(file.type)) {
      setError(`That file type is not accepted. Use ${extensions}.`);
      setSelected(null);
      return;
    }
    if (file.size > maxSize) {
      setError(
        `${formatFileSize(file.size)} is too large. The limit is ${formatFileSize(maxSize)}.`,
      );
      setSelected(null);
      return;
    }

    setError(null);
    setSelected(file);
    onSelect(file);
  };

  const clear = () => {
    setSelected(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the real control is
          the button and the file input inside; these handlers only add drag and
          drop, which has no keyboard equivalent to mirror. */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) handle(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-5 py-7 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card/40 hover:bg-muted/40",
          disabled && "pointer-events-none opacity-60",
          error && "border-destructive/40 bg-destructive/5",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {accept.includes("application/pdf") ? (
            <FileIcon className="size-4" />
          ) : (
            <ImageIcon className="size-4" />
          )}
        </span>

        <div className="space-y-0.5">
          <p className="text-sm font-medium">Drop a file here, or pick one</p>
          <p className="text-xs text-muted-foreground">
            {hint ?? `${extensions} up to ${formatFileSize(maxSize)}`}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => handle(event.target.files?.[0])}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <UploadIcon />
          Choose file
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {selected && !error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{selected.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selected.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Remove selected file"
            onClick={clear}
          >
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
