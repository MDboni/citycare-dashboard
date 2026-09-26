"use client";

import {
  Loader2Icon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminOnly } from "@/components/layout/role-gate";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSystemSettings, useUpdateSetting } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import type { SettingKey, SystemSetting } from "@/types";

/** What each knob actually does, in plain words, plus the unit and a sane range. */
const COPY: Record<
  SettingKey,
  {
    label: string;
    help: string;
    unit: string;
    min: number;
    max: number;
    step: number;
  }
> = {
  REOPEN_LIMIT: {
    label: "Reopen limit",
    help: "How many times a citizen may reopen the same complaint before it stays closed.",
    unit: "times",
    min: 0,
    max: 10,
    step: 1,
  },
  REOPEN_WINDOW_DAYS: {
    label: "Reopen window",
    help: "How long after a complaint is resolved a citizen may still reopen it.",
    unit: "days",
    min: 1,
    max: 90,
    step: 1,
  },
  URGENT_SLA_FACTOR: {
    label: "Urgent SLA factor",
    help: "An urgent complaint gets its category SLA multiplied by this. 0.5 halves the deadline.",
    unit: "×",
    min: 0.1,
    max: 1,
    step: 0.05,
  },
  LOGIN_OTP_TTL_SEC: {
    label: "Login code lifetime",
    help: "How long a two-factor sign-in code stays valid.",
    unit: "seconds",
    min: 60,
    max: 1800,
    step: 30,
  },
  SIGNUP_OTP_TTL_SEC: {
    label: "Signup code lifetime",
    help: "How long the email verification code for a new account stays valid.",
    unit: "seconds",
    min: 120,
    max: 3600,
    step: 60,
  },
};

export default function SettingsPage() {
  // Editing a setting is super-admin only on the API, so the screen says so
  // rather than letting an admin fill in a form that will 403 on save.
  return (
    <AdminOnly superAdmin>
      <SettingsView />
    </AdminOnly>
  );
}

function SettingsView() {
  const { data, isPending, isError, error, refetch } = useSystemSettings();

  return (
    <div className="space-y-6">
      <Alert>
        <SlidersHorizontalIcon />
        <AlertTitle>These are live values</AlertTitle>
        <AlertDescription>
          A saved change applies within about a minute, which is how long the
          API caches a setting. If a value has never been set, the built-in
          default is what is in force.
        </AlertDescription>
      </Alert>

      {isPending && <TableSkeleton rows={5} columns={2} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {data && (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((setting) => (
            <SettingCard key={setting.key} setting={setting} />
          ))}
        </div>
      )}
    </div>
  );
}

function SettingCard({ setting }: { setting: SystemSetting }) {
  const update = useUpdateSetting();
  const key = setting.key as SettingKey;
  const copy = COPY[key];

  const [value, setValue] = useState(String(setting.value));

  useEffect(() => setValue(String(setting.value)), [setting.value]);

  // An unrecognised key means the API grew a knob this console does not know
  // about. Showing it read-only beats hiding it.
  if (!copy) {
    return (
      <Card>
        <CardContent className="space-y-1 p-5">
          <p className="font-mono text-sm font-medium">{setting.key}</p>
          <p className="text-sm text-muted-foreground">
            Current value {String(setting.value)}. This console does not have a
            description for it yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const parsed = Number(value);
  const dirty = parsed !== Number(setting.value);
  const valid =
    Number.isFinite(parsed) && parsed >= copy.min && parsed <= copy.max;

  const save = async (next: number) => {
    try {
      await update.mutateAsync({ key, value: next });
      toast.success(`${copy.label} saved.`);
    } catch (error) {
      toast.error(toApiError(error).message);
      setValue(String(setting.value));
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="h-card">{copy.label}</h2>
            {Number(setting.value) !== setting.default && (
              <Badge variant="outline">Changed from default</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{copy.help}</p>
        </div>

        <Separator />

        <div className="space-y-1.5">
          <FieldLabel htmlFor={`setting-${key}`}>Value</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id={`setting-${key}`}
              type="number"
              inputMode="decimal"
              min={copy.min}
              max={copy.max}
              step={copy.step}
              value={value}
              aria-invalid={!valid}
              onChange={(event) => setValue(event.target.value)}
              className="w-32 tabular-nums"
            />
            <span className="text-sm text-muted-foreground">{copy.unit}</span>
          </div>
          <FieldDescription>
            Between {copy.min} and {copy.max}. The default is {setting.default}.
            {setting.updatedAt
              ? ` Last changed ${formatDateTime(setting.updatedAt)}.`
              : " It has never been changed."}
          </FieldDescription>
          {!valid && (
            <p role="alert" className="text-sm text-destructive">
              Enter a number between {copy.min} and {copy.max}.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          {Number(setting.value) !== setting.default && (
            <Button
              variant="ghost"
              size="sm"
              disabled={update.isPending}
              onClick={() => {
                setValue(String(setting.default));
                void save(setting.default);
              }}
            >
              <RotateCcwIcon />
              Reset to default
            </Button>
          )}
          <Button
            size="sm"
            disabled={!dirty || !valid || update.isPending}
            onClick={() => void save(parsed)}
          >
            {update.isPending && <Loader2Icon className="animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
