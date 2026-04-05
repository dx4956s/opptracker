"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuthStore } from "@/store/authStore";
import { fetcher } from "@/lib/fetcher";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth } = useAuthStore();
  const router = useRouter();

  const { data, error, isLoading } = useSWR<{ username: string; role: "admin" | "user" }>(
    "/api/auth/me",
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data) {
      setAuth(data.username, data.role);
    }
  }, [data, setAuth]);

  useEffect(() => {
    if (error) {
      router.replace("/login");
    }
  }, [error, router]);

  if (isLoading) return null;
  if (error || (!isLoading && !data)) return null;

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-smoky3 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
