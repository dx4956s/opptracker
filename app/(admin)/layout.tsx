"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuthStore } from "@/store/authStore";
import { fetcher } from "@/lib/fetcher";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const { data, error, isLoading } = useSWR<{ username: string; role: "admin" | "user" }>(
    "/api/auth/me",
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data) {
      setAuth(data.username, data.role);
      if (data.role !== "admin") {
        router.replace("/login");
      }
    }
  }, [data, setAuth, router]);

  useEffect(() => {
    if (error) {
      router.replace("/login");
    }
  }, [error, router]);

  if (isLoading) return null;
  if (error || !data || data.role !== "admin") return null;

  return <>{children}</>;
}
