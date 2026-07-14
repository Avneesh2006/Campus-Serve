"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useForumPosts, type ForumPost } from "@/hooks/use-forum-posts";
import {
  ForumFilterBar,
  defaultForumFilters,
  type ForumFilterState,
} from "@/components/community/forum-filter-bar";
import { ForumPostCard } from "@/components/community/forum-post-card";
import { NewPostDialog } from "@/components/community/new-post-dialog";
import { PostDetailDialog } from "@/components/community/post-detail-dialog";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

export function DiscussionForumTab() {
  const [filters, setFilters] = React.useState<ForumFilterState>(defaultForumFilters);

  const { posts, isLoading, createPost, deletePost, toggleLike, toggleBookmark, refresh } =
    useForumPosts({
      category: filters.category !== "all" ? (filters.category as never) : undefined,
      q: filters.q || undefined,
      bookmarked: filters.bookmarkedOnly || undefined,
      sort: filters.sort,
    });

  const [newPostOpen, setNewPostOpen] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<ForumPost | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<ForumPost | null>(null);

  function openPost(post: ForumPost) {
    setSelectedPost(post);
    setDetailOpen(true);
  }

  async function handleDelete() {
    if (!deleting) return;
    await deletePost(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ForumFilterBar filters={filters} onChange={setFilters} />
        <Button variant="brand" className="shrink-0" onClick={() => setNewPostOpen(true)}>
          <Plus className="size-4" />
          New post
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No discussions match these filters yet.
          </p>
          <Button variant="brand" size="sm" className="mt-4" onClick={() => setNewPostOpen(true)}>
            <Plus className="size-4" />
            Start a discussion
          </Button>
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <ForumPostCard
              key={post.id}
              post={post}
              onOpen={openPost}
              onToggleLike={(p) => toggleLike(p.id)}
              onToggleBookmark={(p) => toggleBookmark(p.id)}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <NewPostDialog open={newPostOpen} onOpenChange={setNewPostOpen} onSubmit={createPost} />

      <PostDetailDialog
        post={selectedPost}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) refresh();
        }}
        onToggleLike={(p) => toggleLike(p.id)}
        onToggleBookmark={(p) => toggleBookmark(p.id)}
      />

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this post?"
        description={`This will permanently delete "${deleting?.title}" and all its comments. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
