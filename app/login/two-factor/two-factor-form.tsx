"use client";

import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { OtpForm } from "@/components/auth/otp-form";
import { Button } from "@/components/ui/button";
import { useResendLoginOtp, useVerifyLoginOtp } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import {
  clearChallenge,
  getChallenge,
  type PendingChallenge,
  saveChallenge,
} from "@/lib/challenge";
import { leaveAuthScreen } from "@/lib/navigate";
import { useAuth } from "@/providers";
import { routes } from "@/routes";

export function TwoFactorForm() {
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const verify = useVerifyLoginOtp();
  const resend = useResendLoginOtp();

  const [challenge, setChallenge] = useState<PendingChallenge | null>(null);
  const [expiresInSec, setExpiresInSec] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const next = searchParams.get("next") ?? routes.home;

  useEffect(() => {
    const pending = getChallenge();
    if (pending) {
      setChallenge(pending);
      setExpiresInSec(
        Math.max(0, Math.round((pending.expiresAt - Date.now()) / 1000)),
      );
    }
    setChecked(true);
  }, []);

  if (checked && !challenge) {
    return (
      <AuthCard
        title="That verification has expired"
        description="Codes are good for a few minutes. Sign in again and we will send a new one."
      >
        <Button
          size="lg"
          className="w-full"
          nativeButton={false}
          render={<Link href={routes.login} />}
        >
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  const onSubmit = async (otp: string) => {
    if (!challenge) return;
    setError(null);

    try {
      // `trustDevice` is deliberately not offered: the API only mints a device
      // token for a citizen, so asking a member of staff would be a lie.
      const result = await verify.mutateAsync({
        challengeId: challenge.challengeId,
        otp,
      });

      clearChallenge();

      if (result.user.role === "CITIZEN") {
        setError("This is a citizen account. Use the main CityCare site.");
        return;
      }

      await signIn(result);
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}.`);
      leaveAuthScreen(next);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  };

  const onResend = async () => {
    if (!challenge) return;
    setError(null);
    try {
      const result = await resend.mutateAsync({
        challengeId: challenge.challengeId,
      });
      saveChallenge({
        kind: challenge.kind,
        challengeId: result.challengeId,
        email: challenge.email,
        expiresInSec: result.expiresInSec,
      });
      setExpiresInSec(result.expiresInSec);
      toast.success("A new code is on its way.");
    } catch (caught) {
      toast.error(errorMessage(caught));
    }
  };

  return (
    <AuthCard
      title="Two-factor verification"
      description={
        <span className="flex items-center gap-1.5">
          <ShieldCheckIcon className="size-4 shrink-0 text-muted-foreground" />
          <span>
            Enter the code sent to{" "}
            <strong className="font-medium text-foreground">
              {challenge?.email ?? "your work email"}
            </strong>
          </span>
        </span>
      }
      footer={
        <Link
          href={routes.login}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Start over
        </Link>
      }
    >
      <OtpForm
        onSubmit={onSubmit}
        isSubmitting={verify.isPending}
        error={error}
        onResend={onResend}
        isResending={resend.isPending}
        expiresInSec={expiresInSec}
      />
    </AuthCard>
  );
}
