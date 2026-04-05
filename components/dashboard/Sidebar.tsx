"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { authedFetcher, apiFetch } from "@/lib/fetcher";

const jobsSubItems = [
  { label: "Applied", href: "/dashboard/jobs/applied" },
  { label: "Working", href: "/dashboard/jobs/working" },
  { label: "Left", href: "/dashboard/jobs/left" },
  { label: "Rejected", href: "/dashboard/jobs/rejected" },
];

const contractsSubItems = [
  { label: "Pending", href: "/dashboard/contracts/pending" },
  { label: "Active", href: "/dashboard/contracts/active" },
  { label: "Completed", href: "/dashboard/contracts/completed" },
  { label: "Cancelled", href: "/dashboard/contracts/cancelled" },
];

const freelanceSubItems = [
  { label: "Bidding", href: "/dashboard/freelance/bidding" },
  { label: "In Progress", href: "/dashboard/freelance/in_progress" },
  { label: "Completed", href: "/dashboard/freelance/completed" },
  { label: "Lost", href: "/dashboard/freelance/lost" },
];

const freelanceIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 15c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 10l1.5 3 1.5-1 1 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const contractsIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 2h7l3 3v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M11 2v4h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const dashboardIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const jobsIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { username, clearAuth } = useAuthStore();
  const { data: profileData } = useSWR<{ data: { displayName: string; avatarUrl: string } }>("/api/profile", authedFetcher);
  const displayName = profileData?.data?.displayName ?? "";
  const avatarUrl   = profileData?.data?.avatarUrl ?? "";

  async function handleSignOut() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    router.push("/login");
  }

  const name = displayName.trim() || username || "";
  const initials = name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "??";
  const dashboardActive = pathname === "/dashboard";
  const jobsActive = pathname.startsWith("/dashboard/jobs");
  const contractsActive = pathname.startsWith("/dashboard/contracts");
  const freelanceActive = pathname.startsWith("/dashboard/freelance");
  const profileActive = pathname === "/dashboard/profile";

  return (
    <div className="flex flex-col justify-between bg-white shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] pt-10 pb-8 px-5 w-[260px] min-w-[260px] h-full">
      {/* Top — logo + nav */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-1 mb-10 px-2">
          <span className="text-smoky13 font-bold text-[20px] tracking-tight">OppTracker</span>
          <span className="text-blue500 text-[26px] leading-none font-bold">.</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors ${
              dashboardActive
                ? "bg-blue50 text-blue500"
                : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"
            }`}
          >
            <span className={dashboardActive ? "text-blue500" : "text-smoky6"}>{dashboardIcon}</span>
            Dashboard
          </Link>

          {/* Jobs parent */}
          <Link
            href="/dashboard/jobs/applied"
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors ${
              jobsActive
                ? "bg-blue50 text-blue500"
                : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"
            }`}
          >
            <span className={jobsActive ? "text-blue500" : "text-smoky6"}>{jobsIcon}</span>
            Jobs
          </Link>

          {jobsActive && (
            <div className="flex flex-col gap-0.5 ml-4 pl-4 border-l border-smoky4">
              {jobsSubItems.map((sub) => {
                const subActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`flex items-center px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${
                      subActive ? "text-blue500 bg-blue50" : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"
                    }`}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Contracts parent */}
          <Link
            href="/dashboard/contracts/pending"
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors ${
              contractsActive
                ? "bg-blue50 text-blue500"
                : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"
            }`}
          >
            <span className={contractsActive ? "text-blue500" : "text-smoky6"}>{contractsIcon}</span>
            Contracts
          </Link>

          {contractsActive && (
            <div className="flex flex-col gap-0.5 ml-4 pl-4 border-l border-smoky4">
              {contractsSubItems.map((sub) => {
                const subActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`flex items-center px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${
                      subActive ? "text-blue500 bg-blue50" : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"
                    }`}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Freelance parent */}
          <Link
            href="/dashboard/freelance/bidding"
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-colors ${
              freelanceActive
                ? "bg-blue50 text-blue500"
                : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"
            }`}
          >
            <span className={freelanceActive ? "text-blue500" : "text-smoky6"}>{freelanceIcon}</span>
            Freelance
          </Link>

          {freelanceActive && (
            <div className="flex flex-col gap-0.5 ml-4 pl-4 border-l border-smoky4">
              {freelanceSubItems.map((sub) => {
                const subActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`flex items-center px-3 py-2 rounded-[10px] text-[13px] font-medium transition-colors ${
                      subActive ? "text-blue500 bg-blue50" : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"
                    }`}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom — user + sign out */}
      <div className="flex flex-col gap-2">
        {/* User chip */}
        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${profileActive ? "bg-blue50" : "bg-smoky3 hover:bg-smoky4"}`}
        >
          <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-blue500 flex items-center justify-center text-white text-[12px] font-bold">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : initials
            }
          </div>
          <span className={`text-[13px] font-medium truncate ${profileActive ? "text-blue500" : "text-smoky13"}`}>{name || username}</span>
        </Link>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium text-smoky7 hover:bg-smoky3 hover:text-error transition-colors w-full text-left"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 2H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 13l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
