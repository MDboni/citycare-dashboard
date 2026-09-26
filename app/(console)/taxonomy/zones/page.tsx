"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TextField } from "@/components/shared/form-fields";
import { CreateSubmit, CrudShell } from "@/components/taxonomy/crud-shell";
import { useCreateZone, useWards, useZones } from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import type { Zone } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Name it").max(80, "Too long"),
});

type Values = z.infer<typeof schema>;

export default function ZonesPage() {
  const zones = useZones();
  const wards = useWards();
  const create = useCreateZone();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onCreate = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success(`${values.name} added.`);
      form.reset();
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        form.setError(field as keyof Values, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  const wardCount = (zoneId: string) =>
    (wards.data ?? []).filter((ward) => ward.zoneId === zoneId).length;

  return (
    <CrudShell<Zone>
      title="New zone"
      description="A zone is a group of wards, used for regional reporting. It is the only taxonomy that is purely optional."
      rows={zones.data ?? []}
      isPending={zones.isPending}
      isError={zones.isError}
      error={zones.error}
      onRetry={() => void zones.refetch()}
      emptyMessage="No zones yet. Wards work perfectly well without them."
      rowLabel={(row) => row.name}
      columns={[
        {
          header: "Zone",
          cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
          header: "Wards",
          className: "tabular-nums",
          cell: (row) => (
            <span className="text-sm text-muted-foreground">
              {wardCount(row.id)}
            </span>
          ),
        },
        {
          header: "Created",
          className: "whitespace-nowrap",
          cell: (row) => (
            <span className="text-sm text-muted-foreground">
              {formatDate(row.createdAt)}
            </span>
          ),
        },
      ]}
      createForm={
        <form onSubmit={onCreate} className="space-y-4" noValidate>
          <TextField
            name="name"
            label="Name"
            placeholder="Zone 3 — South"
            required
            register={form.register}
            error={form.formState.errors.name}
          />
          <CreateSubmit
            isSubmitting={form.formState.isSubmitting}
            label="Add zone"
          />
        </form>
      }
      // The API exposes create and list only — a zone has no update or delete
      // endpoint, so neither is offered here.
    />
  );
}
