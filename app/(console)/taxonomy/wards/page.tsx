"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { CreateSubmit, CrudShell } from "@/components/taxonomy/crud-shell";
import { Button } from "@/components/ui/button";
import { useCreateWard, useUpdateWard, useWards, useZones } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import type { Ward } from "@/types";

const schema = z.object({
  number: z
    .number({ error: "Give it a ward number" })
    .int("Whole numbers only")
    .min(1, "At least 1")
    .max(1000, "At most 1000"),
  name: z.string().trim().min(2, "Name it").max(80, "Too long"),
  zoneId: z.uuid().optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export default function WardsPage() {
  const wards = useWards();
  const zones = useZones();
  const create = useCreateWard();
  const update = useUpdateWard();

  const zoneOptions = (zones.data ?? []).map((zone) => ({
    value: zone.id,
    label: zone.name,
  }));

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { number: 1, name: "", zoneId: "" },
  });

  const onCreate = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        number: values.number,
        name: values.name,
        ...(values.zoneId ? { zoneId: values.zoneId } : {}),
      });
      toast.success(`Ward ${values.number} added.`);
      form.reset({
        number: values.number + 1,
        name: "",
        zoneId: values.zoneId,
      });
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        form.setError(field as keyof Values, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  const zoneName = (id: string | null) =>
    id ? (zones.data?.find((zone) => zone.id === id)?.name ?? "—") : null;

  const sorted = [...(wards.data ?? [])].sort((a, b) => a.number - b.number);

  return (
    <CrudShell<Ward>
      title="New ward"
      description="Every complaint is filed against a ward. Grouping wards into zones is optional and only affects reporting."
      rows={sorted}
      isPending={wards.isPending}
      isError={wards.isError}
      error={wards.error}
      onRetry={() => void wards.refetch()}
      emptyMessage="No wards yet. A citizen cannot file a complaint until there is at least one."
      rowLabel={(row) => `Ward ${row.number}`}
      columns={[
        {
          header: "No.",
          className: "w-16 tabular-nums",
          cell: (row) => <span className="font-medium">{row.number}</span>,
        },
        {
          header: "Ward",
          cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
          header: "Zone",
          cell: (row) => (
            <span className="text-sm">
              {row.zone?.name ?? zoneName(row.zoneId) ?? (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </span>
          ),
        },
      ]}
      createForm={
        <form onSubmit={onCreate} className="space-y-4" noValidate>
          <TextField
            name="number"
            label="Ward number"
            type="number"
            inputMode="numeric"
            required
            register={form.register}
            error={form.formState.errors.number}
          />
          <TextField
            name="name"
            label="Name"
            placeholder="Dhanmondi"
            required
            register={form.register}
            error={form.formState.errors.name}
          />
          <SelectField
            name="zoneId"
            label="Zone"
            placeholder={zones.isPending ? "Loading…" : "Optional"}
            options={zoneOptions}
            control={form.control}
            error={form.formState.errors.zoneId}
          />
          <CreateSubmit
            isSubmitting={form.formState.isSubmitting}
            label="Add ward"
          />
        </form>
      }
      editForm={(row, close) => (
        <EditWardForm
          row={row}
          close={close}
          update={update}
          zoneOptions={zoneOptions}
        />
      )}
      // No delete: the API has no ward delete endpoint, because a ward with
      // complaints filed against it cannot be removed without orphaning them.
    />
  );
}

function EditWardForm({
  row,
  close,
  update,
  zoneOptions,
}: {
  row: Ward;
  close: () => void;
  update: ReturnType<typeof useUpdateWard>;
  zoneOptions: { value: string; label: string }[];
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      number: row.number,
      name: row.name,
      zoneId: row.zoneId ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({
        id: row.id,
        number: values.number,
        name: values.name,
        ...(values.zoneId ? { zoneId: values.zoneId } : {}),
      });
      toast.success("Ward updated.");
      close();
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        form.setError(field as keyof Values, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <TextField
        name="number"
        label="Ward number"
        type="number"
        inputMode="numeric"
        required
        register={form.register}
        error={form.formState.errors.number}
      />
      <TextField
        name="name"
        label="Name"
        required
        register={form.register}
        error={form.formState.errors.name}
      />
      <SelectField
        name="zoneId"
        label="Zone"
        options={zoneOptions}
        control={form.control}
        error={form.formState.errors.zoneId}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2Icon className="animate-spin" />
          )}
          Save
        </Button>
      </div>
    </form>
  );
}
