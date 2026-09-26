"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { PriorityPill } from "@/components/shared/status-pill";
import { CreateSubmit, CrudShell } from "@/components/taxonomy/crud-shell";
import { Button } from "@/components/ui/button";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useDepartments,
  useUpdateCategory,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { PRIORITY_META } from "@/lib/constants";
import { formatHours } from "@/lib/format";
import { type Category, PRIORITIES, type Priority } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2, "Name it").max(80, "Too long"),
  departmentId: z.uuid("Pick the owning department"),
  slaHours: z
    .number({ error: "Give it an SLA in hours" })
    .int("Whole hours only")
    .min(1, "At least 1 hour")
    .max(8760, "At most a year"),
  defaultPriority: z.enum(PRIORITIES),
});

type Values = z.infer<typeof schema>;

export default function CategoriesPage() {
  const categories = useCategories();
  const departments = useDepartments();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  const departmentOptions = (departments.data ?? []).map((department) => ({
    value: department.id,
    label: department.name,
  }));

  const priorityOptions = PRIORITIES.map((priority) => ({
    value: priority,
    label: PRIORITY_META[priority].label,
  }));

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      departmentId: "",
      slaHours: 72,
      defaultPriority: "MEDIUM",
    },
  });

  const onCreate = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success(`${values.name} added.`);
      form.reset({
        name: "",
        departmentId: values.departmentId,
        slaHours: 72,
        defaultPriority: "MEDIUM",
      });
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        form.setError(field as keyof Values, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  const departmentName = (id: string) =>
    departments.data?.find((department) => department.id === id)?.name ?? "—";

  return (
    <CrudShell<Category>
      title="New category"
      description="The SLA here is the clock every complaint in this category runs against. Miss it and the complaint escalates on its own."
      rows={categories.data ?? []}
      isPending={categories.isPending}
      isError={categories.isError}
      error={categories.error}
      onRetry={() => void categories.refetch()}
      emptyMessage="No categories yet. A citizen cannot file a complaint until there is at least one."
      rowLabel={(row) => row.name}
      columns={[
        {
          header: "Category",
          cell: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
          header: "Department",
          cell: (row) => (
            <span className="text-sm">
              {row.department?.name ?? departmentName(row.departmentId)}
            </span>
          ),
        },
        {
          header: "SLA",
          className: "whitespace-nowrap",
          cell: (row) => (
            <span className="text-sm tabular-nums">
              {row.slaHours}h
              <span className="ml-1 text-xs text-muted-foreground">
                ({formatHours(row.slaHours)})
              </span>
            </span>
          ),
        },
        {
          header: "Default priority",
          cell: (row) => <PriorityPill priority={row.defaultPriority} />,
        },
      ]}
      createForm={
        <form onSubmit={onCreate} className="space-y-4" noValidate>
          <TextField
            name="name"
            label="Name"
            placeholder="Streetlight not working"
            required
            register={form.register}
            error={form.formState.errors.name}
          />
          <SelectField
            name="departmentId"
            label="Department"
            placeholder={departments.isPending ? "Loading…" : "Pick one"}
            options={departmentOptions}
            required
            control={form.control}
            error={form.formState.errors.departmentId}
          />
          <TextField
            name="slaHours"
            label="SLA hours"
            type="number"
            inputMode="numeric"
            description="72 hours is the usual default."
            required
            register={form.register}
            error={form.formState.errors.slaHours}
          />
          <SelectField
            name="defaultPriority"
            label="Default priority"
            description="Upvotes can still raise it from here."
            options={priorityOptions}
            required
            control={form.control}
            error={form.formState.errors.defaultPriority}
          />
          <CreateSubmit
            isSubmitting={form.formState.isSubmitting}
            label="Add category"
          />
        </form>
      }
      editForm={(row, close) => (
        <EditCategoryForm
          row={row}
          close={close}
          update={update}
          departmentOptions={departmentOptions}
          priorityOptions={priorityOptions}
        />
      )}
      onDelete={async (row) => {
        try {
          await remove.mutateAsync(row.id);
          toast.success(`${row.name} deleted.`);
        } catch (error) {
          toast.error(toApiError(error).message);
        }
      }}
    />
  );
}

function EditCategoryForm({
  row,
  close,
  update,
  departmentOptions,
  priorityOptions,
}: {
  row: Category;
  close: () => void;
  update: ReturnType<typeof useUpdateCategory>;
  departmentOptions: { value: string; label: string }[];
  priorityOptions: { value: Priority; label: string }[];
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: row.name,
      departmentId: row.departmentId,
      slaHours: row.slaHours,
      defaultPriority: row.defaultPriority,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ id: row.id, ...values });
      toast.success("Category updated.");
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
      <SelectField
        name="departmentId"
        label="Department"
        options={departmentOptions}
        required
        control={form.control}
        error={form.formState.errors.departmentId}
      />
      <TextField
        name="slaHours"
        label="SLA hours"
        type="number"
        inputMode="numeric"
        required
        register={form.register}
        error={form.formState.errors.slaHours}
      />
      <SelectField
        name="defaultPriority"
        label="Default priority"
        options={priorityOptions}
        required
        control={form.control}
        error={form.formState.errors.defaultPriority}
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
