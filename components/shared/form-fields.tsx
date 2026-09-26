"use client";

import { cn } from "cn";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import {
  type Control,
  Controller,
  type FieldError,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError as FieldErrorText,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/**
 * Thin wrappers over the Field primitives. They exist so that every one of the
 * app's forms wires label, control, description and error the same way — the
 * accessible bits (`htmlFor`, `aria-invalid`, `role="alert"`) are easy to get
 * subtly wrong twenty-five times.
 */

type BaseProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  description?: ReactNode;
  error?: FieldError;
  required?: boolean;
  className?: string;
};

const Shell = <T extends FieldValues>({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: BaseProps<T> & { id: string; children: ReactNode }) => (
  <Field data-invalid={Boolean(error)} className={className}>
    <FieldLabel htmlFor={id}>
      {label}
      {required && (
        <span className="text-destructive" aria-hidden>
          *
        </span>
      )}
    </FieldLabel>
    {children}
    {description && !error && (
      <FieldDescription>{description}</FieldDescription>
    )}
    <FieldErrorText errors={error ? [error] : undefined} />
  </Field>
);

export function TextField<T extends FieldValues>({
  register,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  ...base
}: BaseProps<T> & {
  register: UseFormRegister<T>;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "email" | "tel" | "decimal";
}) {
  const id = useId();
  return (
    <Shell {...base} id={id}>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(base.error)}
        {...register(
          base.name,
          type === "number" ? { valueAsNumber: true } : {},
        )}
      />
    </Shell>
  );
}

export function PasswordField<T extends FieldValues>({
  register,
  placeholder,
  autoComplete = "current-password",
  ...base
}: BaseProps<T> & {
  register: UseFormRegister<T>;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <Shell {...base} id={id}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(base.error)}
          className="pr-9"
          {...register(base.name)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      </div>
    </Shell>
  );
}

export function TextareaField<T extends FieldValues>({
  register,
  placeholder,
  rows = 5,
  ...base
}: BaseProps<T> & {
  register: UseFormRegister<T>;
  placeholder?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <Shell {...base} id={id}>
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(base.error)}
        {...register(base.name)}
      />
    </Shell>
  );
}

export type SelectOption = { value: string; label: string; hint?: string };

export function SelectField<T extends FieldValues>({
  control,
  options,
  placeholder = "Select an option",
  ...base
}: BaseProps<T> & {
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Shell {...base} id={id}>
      <Controller
        control={control}
        name={base.name}
        render={({ field }) => (
          <Select
            items={options}
            value={(field.value as string) ?? null}
            onValueChange={(value) => field.onChange(value ?? "")}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              aria-invalid={Boolean(base.error)}
            >
              <SelectValue placeholder={placeholder} />
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
        )}
      />
    </Shell>
  );
}

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <Field
      orientation="horizontal"
      className={cn("items-start justify-between gap-6", className)}
    >
      <div className="space-y-0.5">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Switch
            id={id}
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => field.onChange(checked)}
          />
        )}
      />
    </Field>
  );
}
