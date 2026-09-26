"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import {
  GlobeIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { PasswordField, TextField } from "@/components/shared/form-fields";
import { FullPageSpinner, TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { RolePill, UserStatusPill } from "@/components/shared/status-pill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useChangePassword,
  useRevokeSession,
  useSessions,
  useUpdateProfile,
} from "@/hooks";
import { errorMessage, toApiError } from "@/lib/api-error";
import {
  formatDate,
  formatDateTime,
  formatRelative,
  initials,
} from "@/lib/format";
import { useAuth } from "@/providers";
import {
  type ChangePasswordValues,
  changePasswordSchema,
  type UpdateProfileValues,
  updateProfileSchema,
} from "@/validation";

/**
 * A member of staff gets a narrower account page than a citizen: no ward, no data
 * export, and no delete. A staff account is created and removed by an
 * administrator, so offering self-deletion here would be a dead end.
 */
export default function AccountPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user)
    return <FullPageSpinner label="Loading your account" />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Your account"
        description="Your details, your password, and the devices signed in as you."
      />

      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <Avatar className="size-16 shrink-0">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="text-lg">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-0.5">
              <p className="font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <RolePill role={user.role} />
              <UserStatusPill status={user.status} />
              {user.isSuperAdmin && <Badge>Super admin</Badge>}
              {user.twoFactorEnabled && (
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheckIcon aria-hidden />
                  Two-factor on
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {user.department ? `${user.department.name} · ` : ""}
              Staff since {formatDate(user.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <ProfileCard />
      <PasswordCard />
      <SessionsCard />
    </div>
  );
}

function ProfileCard() {
  const { user } = useAuth();
  const update = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (!user) return;
    reset({ name: user.name, phone: user.phone ?? "" });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;

    const patch: { name?: string; phone?: string } = {};
    if (values.name && values.name !== user.name) patch.name = values.name;
    if ((values.phone ?? "") !== (user.phone ?? "")) {
      patch.phone = values.phone ?? "";
    }

    if (!Object.keys(patch).length) {
      toast.info("Nothing has changed.");
      return;
    }

    try {
      await update.mutateAsync(patch);
      toast.success("Profile updated.");
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof UpdateProfileValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-1">
            <h2 className="h-card">Your details</h2>
            <p className="text-sm text-muted-foreground">
              Your email and department are set by an administrator and cannot
              be changed from here.
            </p>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="name"
              label="Full name"
              autoComplete="name"
              register={register}
              error={errors.name}
            />
            <TextField
              name="phone"
              label="Phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              register={register}
              error={errors.phone}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordCard() {
  const { signOut } = useAuth();
  const change = useChangePassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(response.message);
      await signOut();
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof ChangePasswordValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) {
        setError("currentPassword", { message: api.message });
      }
    }
  });

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-1">
            <h2 className="h-card">Change password</h2>
            <p className="text-sm text-muted-foreground">
              Every session is revoked, including this one, so you will sign in
              again straight away.
            </p>
          </div>

          <Separator />

          <PasswordField
            name="currentPassword"
            label="Current password"
            autoComplete="current-password"
            required
            register={register}
            error={errors.currentPassword}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField
              name="newPassword"
              label="New password"
              autoComplete="new-password"
              description="10+ characters, mixed case, a number and a symbol."
              required
              register={register}
              error={errors.newPassword}
            />
            <PasswordField
              name="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
              required
              register={register}
              error={errors.confirmPassword}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Change password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SessionsCard() {
  const { signOut } = useAuth();
  const { data, isPending, isError, error, refetch } = useSessions();
  const revoke = useRevokeSession();

  const sessions = data ?? [];

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <h2 className="h-card">Signed-in devices</h2>
            <p className="text-sm text-muted-foreground">
              Revoking a session kills its tokens at once. A refresh from that
              device will not bring it back.
            </p>
          </div>

          <Separator />

          {isPending && <TableSkeleton rows={2} columns={3} />}

          {isError && (
            <ErrorState error={error} onRetry={() => void refetch()} />
          )}

          {sessions.length > 0 && (
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
                    session.current
                      ? "border-primary/30 bg-primary/[0.03]"
                      : "border-border",
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <MonitorSmartphoneIcon className="size-4" />
                    </span>

                    <div className="min-w-0 space-y-0.5">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        <span className="truncate">
                          {session.deviceName ?? "Browser session"}
                        </span>
                        {session.current && (
                          <Badge variant="secondary">This device</Badge>
                        )}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        {session.ip && (
                          <span className="flex items-center gap-1">
                            <GlobeIcon className="size-3" aria-hidden />
                            {session.ip}
                          </span>
                        )}
                        <span title={formatDateTime(session.lastUsedAt)}>
                          Last used {formatRelative(session.lastUsedAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      disabled={revoke.isPending}
                      onClick={async () => {
                        try {
                          await revoke.mutateAsync(session.id);
                          toast.success("That session is gone.");
                        } catch (caught) {
                          toast.error(errorMessage(caught));
                        }
                      }}
                    >
                      {revoke.isPending ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <LogOutIcon />
                      )}
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTitle>Lost a device?</AlertTitle>
        <AlertDescription>
          <span>
            Signing out everywhere revokes every session, this one included. Do
            it if you think somebody else has your password — then change it.
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="mt-2 w-fit"
            onClick={() => void signOut({ everywhere: true })}
          >
            <LogOutIcon data-icon="inline-start" />
            Sign out everywhere
          </Button>
        </AlertDescription>
      </Alert>
    </>
  );
}
