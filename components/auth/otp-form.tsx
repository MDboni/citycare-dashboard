"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

/**
 * The six-digit form shared by signup verification, login 2FA and enabling 2FA.
 *
 * It submits itself the moment the sixth digit lands: an OTP has exactly one
 * valid length, so asking for a second gesture only adds a step. Attempts are
 * capped server-side, so an accidental early submit costs one of five tries and
 * the caller surfaces the error.
 */
export function OtpForm({
  onSubmit,
  isSubmitting,
  error,
  onResend,
  isResending,
  expiresInSec,
  footer,
}: {
  onSubmit: (otp: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
  onResend?: () => void;
  isResending?: boolean;
  expiresInSec?: number;
  footer?: React.ReactNode;
}) {
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(expiresInSec ?? 0);

  useEffect(() => setSecondsLeft(expiresInSec ?? 0), [expiresInSec]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(
      () => setSecondsLeft((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // A rejected code stays on screen so the user can see what they typed.
  useEffect(() => {
    if (error) setOtp("");
  }, [error]);

  const complete = (value: string) => {
    setOtp(value);
    if (value.length === 6 && !isSubmitting) onSubmit(value);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (otp.length === 6) onSubmit(otp);
      }}
    >
      <div className="space-y-2">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={complete}
          disabled={isSubmitting}
          autoFocus
          containerClassName="justify-center gap-2"
          aria-label="Six digit verification code"
          aria-invalid={Boolean(error)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="size-11 text-base" />
            <InputOTPSlot index={1} className="size-11 text-base" />
            <InputOTPSlot index={2} className="size-11 text-base" />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} className="size-11 text-base" />
            <InputOTPSlot index={4} className="size-11 text-base" />
            <InputOTPSlot index={5} className="size-11 text-base" />
          </InputOTPGroup>
        </InputOTP>

        {error && <FieldError className="text-center">{error}</FieldError>}

        {secondsLeft > 0 && !error && (
          <p className="text-center text-xs text-muted-foreground tabular-nums">
            This code expires in {minutes}:{String(seconds).padStart(2, "0")}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={otp.length !== 6 || isSubmitting}
      >
        {isSubmitting && <Loader2Icon className="animate-spin" />}
        Verify and continue
      </Button>

      {onResend && (
        <div className="text-center text-sm text-muted-foreground">
          Did not get it?{" "}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0"
            disabled={isResending}
            onClick={onResend}
          >
            {isResending ? "Sending…" : "Send a new code"}
          </Button>
        </div>
      )}

      {footer}
    </form>
  );
}
