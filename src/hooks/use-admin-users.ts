"use client";

import * as React from "react";
import { toast } from "sonner";

export type UserRole = "STUDENT" | "SUB_ADMIN" | "ADMIN" | "SUPER_ADMIN";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  collegeName: string | null;
  course: string | null;
  semester: number | null;
  createdAt: string;
}

export function useAdminUsers(filters: { q?: string; role?: UserRole } = {}) {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const filterKey = JSON.stringify(filters);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      if (filters.q) search.set("q", filters.q);
      if (filters.role) search.set("role", filters.role);
      const res = await fetch(`/api/admin/users?${search.toString()}`);
      const json = await res.json();
      if (res.ok) setUsers(json.users ?? []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateRole(id: string, role: UserRole) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update role");
      return null;
    }
    toast.success("Role updated");
    await refresh();
    return json.user as AdminUser;
  }

  async function deleteUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete user");
      return false;
    }
    toast.success("User deleted");
    await refresh();
    return true;
  }

  return { users, isLoading, refresh, updateRole, deleteUser };
}
