import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="CityCare staff console">
          <div className="space-y-4" aria-hidden>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </AuthCard>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
