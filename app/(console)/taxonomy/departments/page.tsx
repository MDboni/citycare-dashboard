"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TextField } from "@/components/shared/form-fields";
import { CreateSubmit, CrudShell } from "@/components/taxonomy/crud-shell";
import { Button } from "@/components/ui/button";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import type { Department } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Name it").max(80, "Too long"),
  email: z.email("Enter a valid email").max(254).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export default function DepartmentsPage() {
  const departments = useDepartments();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const remove = useDeleteDepartment();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  const onCreate = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        name: values.name,
        ...(values.email ? { email: values.email } : {}),
      });
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

  return (
    <CrudShell<Department>
      title="New department"
      description="A department owns categories, and an officer belongs to exactly one. The email is where SLA escalation notices go."
      rows={departments.data ?? []}
      isPending={departments.isPending}
      isError={departments.isError}
      error={departments.error}
      onRetry={() => void departments.refetch()}
      emptyMessage="No departments yet. Add the first one to start filing complaints."
      rowLabel={(row) => row.name}
      columns={[
        {
          header: "Department",
          cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
          header: "Escalation email",
          cell: (row) =>
            row.email ? (
              <a
                href={`mailto:${row.email}`}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                {row.email}
              </a>
            ) : (
              <span className="text-sm text-muted-foreground">Not set</span>
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
            placeholder="Public Works"
            required
            register={form.register}
            error={form.formState.errors.name}
          />
          <TextField
            name="email"
            label="Escalation email"
            type="email"
            inputMode="email"
            placeholder="works@citycare.com"
            description="Optional. Breached complaints are emailed here."
            register={form.register}
            error={form.formState.errors.email}
          />
          <CreateSubmit
            isSubmitting={form.formState.isSubmitting}
            label="Add department"
          />
        </form>
      }
      editForm={(row, close) => (
        <EditDepartmentForm row={row} close={close} update={update} />
      )}
      onDelete={async (row) => {
        try {
          await remove.mutateAsync(row.id);
          toast.success(`${row.name} deleted.`);
        } catch (error) {
          toast.error(toApiError(error).message);
        }
      }}
      deleteWarning="A department with categories still attached will be refused. Move or delete those first. This is a soft delete, so a super admin can restore it."
    />
  );
}

function EditDepartmentForm({
  row,
  close,
  update,
}: {
  row: Department;
  close: () => void;
  update: ReturnType<typeof useUpdateDepartment>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: row.name, email: row.email ?? "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({
        id: row.id,
        name: values.name,
        ...(values.email ? { email: values.email } : {}),
      });
      toast.success("Department updated.");
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
        name="email"
        label="Escalation email"
        type="email"
        inputMode="email"
        register={form.register}
        error={form.formState.errors.email}
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
