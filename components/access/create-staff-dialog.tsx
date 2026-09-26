"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateAdmin,
  useCreateOfficer,
  useDepartments,
  usePermission,
  useWards,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import type { AdminUser } from "@/types";
import { emailSchema, passwordSchema } from "@/validation";

const officerSchema = z.object({
  name: z.string().trim().min(2, "Enter their full name").max(80),
  email: emailSchema,
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  departmentId: z.uuid("Pick a department"),
  wardId: z.uuid().optional().or(z.literal("")),
});

const adminSchema = z.object({
  name: z.string().trim().min(2, "Enter their full name").max(80),
  email: emailSchema,
  password: passwordSchema,
});

type OfficerValues = z.infer<typeof officerSchema>;
type AdminValues = z.infer<typeof adminSchema>;

/**
 * Creating a staff account from the Access screen.
 *
 * The same two endpoints People → Staff uses, surfaced here because this is
 * where someone is already thinking about who may do what — and `onCreated`
 * hands the new account straight to the role picker, so a new officer does not
 * sit on the built-in fallback until somebody remembers to come back.
 *
 * Officers and admins are created differently on purpose: an officer never gets
 * a password here (the API emails them a set-password link), while an admin is
 * created with one and is super-admin-only to begin with.
 */
export function CreateStaffDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (user: AdminUser) => void;
}) {
  const { isSuperAdmin } = usePermission();
  const [tab, setTab] = useState("officer");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New staff member</DialogTitle>
          <DialogDescription>
            Create the account, then pick the roles it should hold.
          </DialogDescription>
        </DialogHeader>

        {isSuperAdmin ? (
          <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
            <TabsList>
              <TabsTrigger value="officer">Officer</TabsTrigger>
              <TabsTrigger value="admin">Administrator</TabsTrigger>
            </TabsList>

            <TabsContent value="officer" className="mt-4">
              <OfficerForm onCreated={onCreated} />
            </TabsContent>
            <TabsContent value="admin" className="mt-4">
              <AdminForm onCreated={onCreated} />
            </TabsContent>
          </Tabs>
        ) : (
          // Creating an administrator is super-admin-only on the API, so an
          // ordinary admin is not shown a tab that would 403 on submit.
          <OfficerForm onCreated={onCreated} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function OfficerForm({ onCreated }: { onCreated: (user: AdminUser) => void }) {
  const departments = useDepartments();
  const wards = useWards();
  const create = useCreateOfficer();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OfficerValues>({
    resolver: zodResolver(officerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      departmentId: "",
      wardId: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const user = await create.mutateAsync({
        name: values.name,
        email: values.email,
        departmentId: values.departmentId,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.wardId ? { wardId: values.wardId } : {}),
      });
      toast.success(`${values.name} can now set a password from their email.`);
      reset();
      onCreated(user);
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof OfficerValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <FieldLabel htmlFor="officer-name">Full name</FieldLabel>
        <Input id="officer-name" {...register("name")} />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="officer-email">Email</FieldLabel>
        <Input id="officer-email" type="email" {...register("email")} />
        <FieldDescription>
          The set-password link goes here, so it has to be one they can reach.
        </FieldDescription>
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <FieldLabel htmlFor="officer-department">Department</FieldLabel>
          <select
            id="officer-department"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("departmentId")}
          >
            <option value="">Select a department</option>
            {(departments.data ?? []).map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          {errors.departmentId && (
            <FieldError>{errors.departmentId.message}</FieldError>
          )}
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="officer-ward">Ward (optional)</FieldLabel>
          <select
            id="officer-ward"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("wardId")}
          >
            <option value="">Any ward</option>
            {(wards.data ?? []).map((ward) => (
              <option key={ward.id} value={ward.id}>
                Ward {ward.number} — {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="officer-phone">Phone (optional)</FieldLabel>
        <Input id="officer-phone" {...register("phone")} />
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Create officer
        </Button>
      </DialogFooter>
    </form>
  );
}

function AdminForm({ onCreated }: { onCreated: (user: AdminUser) => void }) {
  const create = useCreateAdmin();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const user = await create.mutateAsync(values);
      toast.success(`${values.name} is now an administrator.`);
      reset();
      onCreated(user);
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof AdminValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <FieldLabel htmlFor="admin-name">Full name</FieldLabel>
        <Input id="admin-name" {...register("name")} />
        {errors.name && <FieldError>{errors.name.message}</FieldError>}
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="admin-email">Email</FieldLabel>
        <Input id="admin-email" type="email" {...register("email")} />
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="admin-password">Temporary password</FieldLabel>
        <Input id="admin-password" type="password" {...register("password")} />
        <FieldDescription>
          Send it to them over something other than email, and have them change
          it from Account → Security once they are in.
        </FieldDescription>
        {errors.password && <FieldError>{errors.password.message}</FieldError>}
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Create administrator
        </Button>
      </DialogFooter>
    </form>
  );
}
