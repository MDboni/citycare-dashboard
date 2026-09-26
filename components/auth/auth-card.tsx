import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** One frame for every auth screen, so the six of them read as one flow. */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {children}
        {footer && (
          <div className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
