"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2Icon,
  ShieldIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ErrorState } from "@/components/shared/error-state";
import {
  PasswordField,
  SelectField,
  TextField,
} from "@/components/shared/form-fields";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { RolePill, UserStatusPill } from "@/components/shared/status-pill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminUsers,
  useCreateAdmin,
  useCreateOfficer,
  useDepartments,
  useRemoveAdmin,
  useWards,
} from "@/hooks";
import { toApiError } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/providers";
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

export function StaffView() {
  const { user: me } = useAuth();

  const officers = useAdminUsers({ role: "OFFICER", limit: 100 });
  const admins = useAdminUsers({ role: "ADMIN", limit: 100 });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Staff"
        description="Officers handle complaints for one department. Administrators run the console. Only a super admin can create or remove another administrator."
      />

      <Tabs defaultValue="officers">
        <TabsList>
          <TabsTrigger value="officers">Officers</TabsTrigger>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
        </TabsList>

        <TabsContent value="officers" className="space-y-4 pt-4">
          <NewOfficerCard />

          <Card className="gap-0 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="h-card">Officers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {officers.isPending && (
                <div className="p-4">
                  <TableSkeleton rows={4} columns={4} />
                </div>
              )}
              {officers.isError && (
                <div className="p-4">
                  <ErrorState
                    error={officers.error}
                    onRetry={() => void officers.refetch()}
                  />
                </div>
              )}
              {officers.data && (
                <StaffTable
                  rows={officers.data.items}
                  emptyMessage="No officers yet. Create one above and they will get a set-password email."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4 pt-4">
          {me?.isSuperAdmin ? (
            <NewAdminCard />
          ) : (
            <Alert>
              <ShieldIcon />
              <AlertTitle>Super admin only</AlertTitle>
              <AlertDescription>
                Creating and removing administrators is limited to super admins.
                You can still see who holds the role below.
              </AlertDescription>
            </Alert>
          )}

          <Card className="gap-0 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="h-card">Administrators</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {admins.isPending && (
                <div className="p-4">
                  <TableSkeleton rows={3} columns={4} />
                </div>
              )}
              {admins.isError && (
                <div className="p-4">
                  <ErrorState
                    error={admins.error}
                    onRetry={() => void admins.refetch()}
                  />
                </div>
              )}
              {admins.data && (
                <StaffTable
                  rows={admins.data.items}
                  emptyMessage="No administrators found."
                  removable={me?.isSuperAdmin}
                  currentUserId={me?.id}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StaffTable({
  rows,
  emptyMessage,
  removable = false,
  currentUserId,
}: {
  rows: import("@/types").AdminUser[];
  emptyMessage: string;
  removable?: boolean;
  currentUserId?: string;
}) {
  const remove = useRemoveAdmin();
  const [target, setTarget] = useState<string | null>(null);

  if (!rows.length) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  const pending = rows.find((row) => row.id === target);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Person</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Joined</TableHead>
              {removable && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <p className="flex items-center gap-1.5 font-medium">
                    <span className="truncate">{row.name}</span>
                    {row.isSuperAdmin && <Badge>Super admin</Badge>}
                    {row.id === currentUserId && (
                      <Badge variant="secondary">You</Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.email}
                  </p>
                </TableCell>

                <TableCell>
                  <RolePill role={row.role} />
                </TableCell>

                <TableCell>
                  <UserStatusPill status={row.status} />
                </TableCell>

                <TableCell className="text-sm">
                  {row.department?.name ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                  {formatDate(row.createdAt)}
                </TableCell>

                {removable && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${row.name}`}
                      // The API refuses to remove the last super admin; hiding it
                      // for self and super admins keeps the UI honest about that.
                      disabled={row.isSuperAdmin || row.id === currentUserId}
                      onClick={() => setTarget(row.id)}
                    >
                      <Trash2Icon />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove {pending?.name}?</DialogTitle>
            <DialogDescription>
              Their administrator access ends and every session is revoked. The
              account itself, and anything they have done, stays on the record.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={async () => {
                if (!target) return;
                try {
                  await remove.mutateAsync(target);
                  toast.success("Administrator removed.");
                  setTarget(null);
                } catch (error) {
                  toast.error(toApiError(error).message);
                }
              }}
            >
              {remove.isPending && <Loader2Icon className="animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NewOfficerCard() {
  const departments = useDepartments();
  const wards = useWards();
  const create = useCreateOfficer();

  const {
    register,
    control,
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

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        name: values.name,
        email: values.email,
        departmentId: values.departmentId,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.wardId ? { wardId: values.wardId } : {}),
      });
      toast.success(`${values.name} can now set a password from their email.`);
      reset();
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof OfficerValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-1">
            <h2 className="h-card">Add an officer</h2>
            <p className="text-sm text-muted-foreground">
              You do not set a password. CityCare emails them a link to choose
              their own, and their account starts with two-factor already on.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="name"
              label="Full name"
              placeholder="Rafiq Islam"
              required
              register={register}
              error={errors.name}
            />
            <TextField
              name="email"
              label="Work email"
              type="email"
              placeholder="rafiq@citycare.com"
              inputMode="email"
              required
              register={register}
              error={errors.email}
            />
            <TextField
              name="phone"
              label="Phone"
              type="tel"
              inputMode="tel"
              placeholder="01700000000"
              register={register}
              error={errors.phone}
            />
            <SelectField
              name="departmentId"
              label="Department"
              placeholder={
                departments.isPending ? "Loading…" : "Pick a department"
              }
              description="Decides which complaints they can see at all."
              options={(departments.data ?? []).map((department) => ({
                value: department.id,
                label: department.name,
              }))}
              required
              control={control}
              error={errors.departmentId}
            />
            <SelectField
              name="wardId"
              label="Ward"
              placeholder={wards.isPending ? "Loading…" : "Optional"}
              description="Optional. Helps automatic assignment pick them."
              options={(wards.data ?? []).map((ward) => ({
                value: ward.id,
                label: `Ward ${ward.number} — ${ward.name}`,
              }))}
              control={control}
              error={errors.wardId}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <UserPlusIcon data-icon="inline-start" />
              )}
              Create officer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NewAdminCard() {
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

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      toast.success(`${values.name} now has administrator access.`);
      reset();
    } catch (error) {
      const api = toApiError(error);
      for (const [field, message] of Object.entries(api.fieldErrors)) {
        setError(field as keyof AdminValues, { message });
      }
      if (!Object.keys(api.fieldErrors).length) toast.error(api.message);
    }
  });

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-1">
            <h2 className="h-card">Add an administrator</h2>
            <p className="text-sm text-muted-foreground">
              Unlike an officer, an administrator is created with a password you
              set. Hand it over in person and ask them to change it.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="name"
              label="Full name"
              required
              register={register}
              error={errors.name}
            />
            <TextField
              name="email"
              label="Work email"
              type="email"
              inputMode="email"
              required
              register={register}
              error={errors.email}
            />
          </div>

          <PasswordField
            name="password"
            label="Temporary password"
            autoComplete="new-password"
            description="At least 10 characters, with upper and lower case, a number and a symbol."
            required
            register={register}
            error={errors.password}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <ShieldIcon data-icon="inline-start" />
              )}
              Create administrator
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
