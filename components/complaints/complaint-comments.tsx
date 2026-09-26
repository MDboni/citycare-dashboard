"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { EyeOffIcon, Loader2Icon, SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useAddComplaintComment } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { formatRelative, initials } from "@/lib/format";
import type { ComplaintComment, Role } from "@/types";
import { type CommentValues, commentSchema } from "@/validation";

/**
 * The conversation on a complaint.
 *
 * Internal notes are filtered out of the citizen response by the query itself,
 * not hidden here — so a citizen never receives one in the first place. The
 * checkbox that creates them only appears for staff.
 */
export function ComplaintComments({
  complaintId,
  comments,
  currentUserId,
  role,
  authorNames,
}: {
  complaintId: string;
  comments: ComplaintComment[];
  currentUserId: string;
  role: Role;
  authorNames: Record<string, string>;
}) {
  const add = useAddComplaintComment(complaintId);
  const canWriteInternal = role !== "CITIZEN";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "", isInternal: false },
  });

  const isInternal = watch("isInternal");

  const onSubmit = handleSubmit(async (values) => {
    try {
      await add.mutateAsync({
        body: values.body,
        isInternal: Boolean(values.isInternal),
      });
      reset({ body: "", isInternal: values.isInternal });
      toast.success(
        values.isInternal ? "Internal note added." : "Comment posted.",
      );
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  return (
    <section className="space-y-4">
      <h2 className="h-card">
        Comments
        {comments.length > 0 && (
          <span className="ml-1.5 font-normal text-muted-foreground">
            {comments.length}
          </span>
        )}
      </h2>

      {comments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-6 text-center text-sm text-muted-foreground">
          No comments yet. Anything you add here is visible to the officer
          handling this complaint.
        </p>
      ) : (
        <ol className="space-y-3">
          {comments.map((comment) => {
            const mine = comment.authorId === currentUserId;
            const name = mine
              ? "You"
              : (authorNames[comment.authorId] ?? "CityCare staff");

            return (
              <li
                key={comment.id}
                className={cn(
                  "flex gap-3 rounded-lg border p-3",
                  comment.isInternal
                    ? "border-warning/30 bg-warning/5"
                    : "border-border bg-card",
                )}
              >
                <Avatar className="mt-0.5 size-7 shrink-0">
                  <AvatarFallback className="text-[11px]">
                    {initials(name === "You" ? "Y" : name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-medium">{name}</p>
                    {comment.isInternal && (
                      <Badge variant="outline" className="gap-1 text-warning">
                        <EyeOffIcon aria-hidden />
                        Internal
                      </Badge>
                    )}
                    <time
                      dateTime={comment.createdAt}
                      className="text-xs text-muted-foreground"
                    >
                      {formatRelative(comment.createdAt)}
                    </time>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-foreground/90">
                    {comment.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <form onSubmit={onSubmit} className="space-y-2" noValidate>
        <FieldLabel htmlFor="comment-body" className="sr-only">
          Add a comment
        </FieldLabel>
        <Textarea
          id="comment-body"
          rows={3}
          placeholder={
            isInternal
              ? "A note for colleagues only. The citizen will not see this."
              : "Add anything that would help — a change since you reported it, or an answer to a question."
          }
          aria-invalid={Boolean(errors.body)}
          {...register("body")}
        />
        <FieldError errors={errors.body ? [errors.body] : undefined} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {canWriteInternal ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id="comment-internal"
                checked={Boolean(isInternal)}
                onCheckedChange={(checked) =>
                  setValue("isInternal", Boolean(checked))
                }
              />
              <FieldLabel
                htmlFor="comment-internal"
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                Internal note
              </FieldLabel>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Visible to you and the officers handling this complaint.
            </span>
          )}

          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SendIcon data-icon="inline-start" />
            )}
            Post
          </Button>
        </div>
      </form>
    </section>
  );
}
