"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { authedFetcher, apiFetch } from "@/lib/fetcher";
import UserTable from "@/components/admin/UserTable";
import UserModal from "@/components/admin/UserModal";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}

async function createFetcher(url: string, { arg }: { arg: object }) {
  return apiFetch(url, { method: "POST", json: arg });
}

async function updateFetcher(url: string, { arg }: { arg: object }) {
  return apiFetch(url, { method: "PATCH", json: arg });
}

async function deleteFetcher(url: string) {
  return apiFetch(url, { method: "DELETE" });
}

export default function AdminUsersPage() {
  const { username, clearAuth } = useAuthStore();
  const router = useRouter();

  const { data: users, mutate, isLoading } = useSWR<User[]>("/api/admin/users", authedFetcher);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [modalError, setModalError] = useState("");

  const { trigger: create, isMutating: creating } = useSWRMutation("/api/admin/users", createFetcher);
  const { trigger: update, isMutating: updating } = useSWRMutation(
    editTarget ? `/api/admin/users/${editTarget.id}` : null,
    updateFetcher
  );
  const { trigger: remove, isMutating: deleting } = useSWRMutation(
    deleteTarget ? `/api/admin/users/${deleteTarget.id}` : null,
    deleteFetcher
  );

  function openCreate() {
    setEditTarget(null);
    setModalError("");
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditTarget(user);
    setModalError("");
    setModalOpen(true);
  }

  async function handleSubmit(data: { username: string; password: string; role: "admin" | "user" }) {
    try {
      setModalError("");
      if (editTarget) {
        const payload: Record<string, string> = { username: data.username, role: data.role };
        if (data.password) payload.password = data.password;
        await update(payload);
      } else {
        await create(data);
      }
      await mutate();
      setModalOpen(false);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await remove();
    await mutate();
    setDeleteTarget(null);
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-smoky3 font-sans">
      {/* Header */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-smoky13 font-bold text-[20px]">OppTracker</span>
          <span className="text-blue500 text-[24px] leading-none font-bold">.</span>
          <span className="ml-3 text-smoky6 text-[14px]">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-smoky8 text-[14px]">{username}</span>
          <button
            onClick={handleLogout}
            className="text-[13px] font-medium text-smoky7 hover:text-error transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-8 py-10">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-smoky13 font-bold text-[24px]">
              Users<span className="text-blue500">.</span>
            </h1>
            <p className="text-smoky7 text-[14px] mt-0.5">Manage system users and their roles.</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue500 hover:bg-blue600 text-white font-bold text-[14px] px-5 h-[44px] rounded-[12px] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New User
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px] text-smoky6 text-[14px]">
              Loading...
            </div>
          ) : (
            <UserTable
              users={users ?? []}
              onEdit={openEdit}
              onDelete={(u) => setDeleteTarget(u)}
            />
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editTarget ?? undefined}
        loading={creating || updating}
        error={modalError}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[400px] p-8">
            <h3 className="text-smoky13 font-bold text-[20px] mb-1">Delete user?</h3>
            <p className="text-smoky7 text-[14px] mb-6">
              <span className="font-semibold text-smoky13">{deleteTarget.username}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-[48px] rounded-[12px] bg-error hover:opacity-90 disabled:opacity-50 text-white text-[14px] font-bold transition-all"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
