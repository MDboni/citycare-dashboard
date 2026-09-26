import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Skeleton } from "@/components/ui/skeleton";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = {
  title: "Two-factor verification",
};

export default function TwoFactorPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Two-factor verification">
          <Skeleton className="h-11 w-full" aria-hidden />
        </AuthCard>
      }
    >
      <TwoFactorForm />
    </Suspense>
  );
}
