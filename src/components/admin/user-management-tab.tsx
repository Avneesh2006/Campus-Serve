"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminUsers, type AdminUser } from "@/hooks/use-admin-users";
import { DeleteConfirmDialog } from "@/components/attendance/delete-confirm-dialog";

export function UserManagementTab() {
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState("all");
  const { users, isLoading, updateRole, deleteUser } = useAdminUsers({
    q: query || undefined,
    role: role !== "all" ? (role as "STUDENT" | "ADMIN") : undefined,
  });
  const [deleting, setDeleting] = React.useState<AdminUser | null>(null);

  async function handleDelete() {
    if (!deleting) return;
    await deleteUser(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-8"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="sm:w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">College</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-4">
                  <Skeleton className="h-10 w-full" />
                </td>
              </tr>
            )}

            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}

            {!isLoading &&
              users.map((user) => {
                const initials =
                  user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "?";

                return (
                  <tr key={user.id}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.name ?? "Unnamed"}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">
                      {user.collegeName || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <Select
                        value={user.role}
                        onValueChange={(v) => updateRole(user.id, v as "STUDENT" | "ADMIN")}
                      >
                        <SelectTrigger className="h-8 w-[110px]" size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(user)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {!isLoading && users.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <Badge variant="outline" className="mr-1.5">
            {users.length}
          </Badge>
          user{users.length === 1 ? "" : "s"} shown
        </p>
      )}

      <DeleteConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this user?"
        description={`This will permanently delete "${deleting?.name ?? deleting?.email}" and all of their data. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
