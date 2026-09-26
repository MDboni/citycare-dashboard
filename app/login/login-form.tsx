"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { PasswordField, TextField } from "@/components/shared/form-fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { saveChallenge } from "@/lib/challenge";
import { useAuth } from "@/providers";
import { routes } from "@/routes";
import { type LoginValues, loginSchema } from "@/validation";

/**
 * Staff sign-in.
 *
 * There is no "trust this device" here and no Google button: the API only issues
 * a device token to a citizen, and officer and admin accounts are created with
 * two-factor already on. So the expected path is password, then a code.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const next = searchParams.get("next") ?? routes.home;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login.mutateAsync(values);

      if (result.twoFactorRequired) {
        saveChallenge({
          kind: "login",
          challengeId: result.challengeId,
          email: result.email,
          expiresInSec: result.expiresInSec,
        });
        router.push(`${routes.twoFactor}?next=${encodeURIComponent(next)}`);
        return;
      }

      if (result.user.role === "CITIZEN") {
        // The gate inside the console would catch this, but saying so here saves
        // a confusing redirect into a page they cannot use.
        setError("email", {
          message: "This is a citizen account. Use the main CityCare site.",
        });
        return;
      }

      await signIn(result);
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}.`);
      router.replace(next);
    } catch (error) {
      const api = toApiError(error);

      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof LoginValues, { message });
      }

      if (!Object.keys(api.fieldErrors).length) {
        if (api.status === 401) setError("password", { message: api.message });
        else toast.error(api.message);
      }
    }
  });

  return (
    <AuthCard
      title="CityCare staff console"
      description="For officers and administrators. Citizens use the main CityCare site."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          name="email"
          label="Work email"
          type="email"
          placeholder="officer@citycare.com"
          autoComplete="email"
          inputMode="email"
          required
          register={register}
          error={errors.email}
        />

        <PasswordField
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          register={register}
          error={errors.password}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Sign in
        </Button>
      </form>

      <Alert>
        <ShieldCheckIcon />
        <AlertDescription>
          Staff accounts keep two-factor verification on, so the next step is a
          6 digit code sent to your work email. Every sign-in, successful or
          not, is written to the security log.
        </AlertDescription>
      </Alert>
    </AuthCard>
  );
}
