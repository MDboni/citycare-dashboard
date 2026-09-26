"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SwitchField, TextField } from "@/components/shared/form-fields";
import { CreateSubmit, CrudShell } from "@/components/taxonomy/crud-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useCreateServiceType,
  useServiceTypes,
  useUpdateServiceType,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { formatBdt } from "@/lib/format";
import type { ServiceType } from "@/types";

/**
 * The fee is a string all the way down, matching the API. A municipal fee going
 * through a float is how 500.00 becomes 499.99999999999994, so nothing here ever
 * calls `Number()` on it except to render.
 */
const schema = z.object({
  name: z.string().trim().min(2, "Name it").max(120, "Too long"),
  fee: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Write it like 500 or 500.00"),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;

export default function ServiceTypesPage() {
  const serviceTypes = useServiceTypes();
  const create = useCreateServiceType();
  const update = useUpdateServiceType();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", fee: "", isActive: true },
  });

  const onCreate = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success(`${values.name} added.`);
      form.reset({ name: "", fee: "", isActive: true });
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        form.setError(field as keyof Values, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  return (
    <CrudShell<ServiceType>
      title="New service type"
      description="What a citizen can apply and pay for. Turning one inactive hides it from the catalogue without touching the applications already filed against it."
      rows={serviceTypes.data ?? []}
      isPending={serviceTypes.isPending}
      isError={serviceTypes.isError}
      error={serviceTypes.error}
      onRetry={() => void serviceTypes.refetch()}
      emptyMessage="No service types yet. The public catalogue is empty until you add one."
      rowLabel={(row) => row.name}
      columns={[
        {
          header: "Service",
          cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
          header: "Fee",
          className: "text-right tabular-nums",
          cell: (row) => <span className="text-sm">{formatBdt(row.fee)}</span>,
        },
        {
          header: "Listed",
          cell: (row) =>
            row.isActive ? (
              <Badge variant="secondary">Active</Badge>
            ) : (
              <Badge variant="outline">Hidden</Badge>
            ),
        },
      ]}
      createForm={
        <form onSubmit={onCreate} className="space-y-4" noValidate>
          <TextField
            name="name"
            label="Name"
            placeholder="Trade licence renewal"
            required
            register={form.register}
            error={form.formState.errors.name}
          />
          <TextField
            name="fee"
            label="Fee (BDT)"
            inputMode="decimal"
            placeholder="500"
            description="Up to two decimal places. The API takes the amount from here, never from the browser."
            required
            register={form.register}
            error={form.formState.errors.fee}
          />
          <SwitchField
            control={form.control}
            name="isActive"
            label="List it publicly"
            description="Off keeps it out of the citizen catalogue."
          />
          <CreateSubmit
            isSubmitting={form.formState.isSubmitting}
            label="Add service type"
          />
        </form>
      }
      editForm={(row, close) => (
        <EditServiceTypeForm row={row} close={close} update={update} />
      )}
      // No delete endpoint: a service type with applications against it has to
      // stay, which is what the active switch is for.
    />
  );
}

function EditServiceTypeForm({
  row,
  close,
  update,
}: {
  row: ServiceType;
  close: () => void;
  update: ReturnType<typeof useUpdateServiceType>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: row.name, fee: row.fee, isActive: row.isActive },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: row.id, ...values });
      toast.success("Service type updated.");
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
        name="name"
        label="Name"
        required
        register={form.register}
        error={form.formState.errors.name}
      />
      <TextField
        name="fee"
        label="Fee (BDT)"
        inputMode="decimal"
        description="Changing this does not re-price an application that is already paid."
        required
        register={form.register}
        error={form.formState.errors.fee}
      />
      <SwitchField
        control={form.control}
        name="isActive"
        label="List it publicly"
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
