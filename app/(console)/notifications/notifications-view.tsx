"use client";

import { cn } from "cn";
import { BellOffIcon, CheckCheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { DataPagination } from "@/components/shared/data-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks";
import { useFilterParams } from "@/hooks/use-filter-params";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime, formatRelative } from "@/lib/format";

const DEFAULTS = { filter: "all", page: "1" };

export function NotificationsView() {
  const { values, setFilter, setPage } = useFilterParams(DEFAULTS);
  const unreadOnly = values.filter === "unread";
  const page = Number(values.page) || 1;

  const { data, isPending, isError, error, refetch } = useNotifications(
    page,
    unreadOnly,
  );
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.items ?? [];
  const hasUnread = notifications.some((notification) => !notification.isRead);

  return (
    <div className="max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Notifications"
        description="Assignments, escalations and anything an administrator sends you."
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={markAllRead.isPending || !hasUnread}
            onClick={async () => {
              try {
                await markAllRead.mutateAsync();
                toast.success("All marked as read.");
              } catch (caught) {
                toast.error(errorMessage(caught));
              }
            }}
          >
            {markAllRead.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <CheckCheckIcon />
            )}
            Mark all read
          </Button>
        }
      />

      <Tabs
        value={values.filter}
        onValueChange={(value) => setFilter("filter", String(value ?? "all"))}
      >
        <TabsList>
          <TabsTrigger value="all">Everything</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      {isPending && <TableSkeleton rows={5} columns={2} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {!isPending && !isError && notifications.length === 0 && (
        <EmptyState
          icon={BellOffIcon}
          title={unreadOnly ? "Nothing unread" : "No notifications yet"}
          description={
            unreadOnly
              ? "You are all caught up."
              : "When a complaint lands in your queue or breaches its SLA, it will show up here."
          }
        />
      )}

      {notifications.length > 0 && (
        <>
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <Card
                  className={cn(
                    "gap-0",
                    !notification.isRead &&
                      "border-primary/30 bg-primary/[0.03]",
                  )}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        notification.isRead ? "bg-transparent" : "bg-primary",
                      )}
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                      <time
                        dateTime={notification.createdAt}
                        title={formatDateTime(notification.createdAt)}
                        className="text-xs text-muted-foreground"
                      >
                        {formatRelative(notification.createdAt)}
                      </time>
                    </div>

                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={markRead.isPending}
                        onClick={async () => {
                          try {
                            await markRead.mutateAsync(notification.id);
                          } catch (caught) {
                            toast.error(errorMessage(caught));
                          }
                        }}
                      >
                        Mark read
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <DataPagination
            meta={data?.meta}
            page={page}
            onPageChange={setPage}
            label="notifications"
          />
        </>
      )}
    </div>
  );
}
