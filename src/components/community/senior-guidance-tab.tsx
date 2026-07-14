"use client";

import * as React from "react";
import { Plus, Search, VenetianMask, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeniorGuidance } from "@/hooks/use-senior-guidance";
import { NewGuidanceQuestionDialog } from "@/components/community/new-guidance-question-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";
import { timeAgo } from "@/components/community/forum-post-card";
import type { SeniorGuidancePost } from "@/hooks/use-senior-guidance";
import { cn } from "@/lib/utils";

export function SeniorGuidanceTab() {
  const [query, setQuery] = React.useState("");
  const { posts, isLoading, createPost, deletePost, markAnswered } = useSeniorGuidance({
    q: query || undefined,
  });

  const [newOpen, setNewOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<SeniorGuidancePost | null>(null);

  async function handleDelete() {
    if (!deleting) return;
    await deletePost(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="pl-8"
          />
        </div>
        <Button variant="brand" className="shrink-0" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" />
          Ask a question
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No questions yet. Ask something and get guidance from seniors.
          </p>
          <Button variant="brand" size="sm" className="mt-4" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" />
            Ask a question
          </Button>
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => {
            const initials =
              post.author.name
                ?.split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "?";

            return (
              <Card key={post.id}>
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-7">
                        {!post.isAnonymous && (
                          <AvatarImage
                            src={post.author.image ?? undefined}
                            alt={post.author.name ?? ""}
                          />
                        )}
                        <AvatarFallback className="text-xs">
                          {post.isAnonymous ? (
                            <VenetianMask className="size-3.5" />
                          ) : (
                            initials
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={post.isAnswered ? "success" : "outline"}
                      className="shrink-0 gap-1"
                    >
                      {post.isAnswered ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <HelpCircle className="size-3" />
                      )}
                      {post.isAnswered ? "Answered" : "Open"}
                    </Badge>
                  </div>

                  <div>
                    <p className="font-medium leading-snug">{post.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{post.body}</p>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {post.isOwnPost && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAnswered(post.id, !post.isAnswered)}
                        className={cn(post.isAnswered && "text-muted-foreground")}
                      >
                        Mark as {post.isAnswered ? "unanswered" : "answered"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(post)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NewGuidanceQuestionDialog open={newOpen} onOpenChange={setNewOpen} onSubmit={createPost} />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this question?"
        description={`This will permanently delete "${deleting?.title}". This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
