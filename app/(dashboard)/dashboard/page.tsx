"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { authedFetcher } from "@/lib/fetcher";
import { formatDate } from "@/lib/dateUtils";

// ─── API response shape ───────────────────────────────────────────────────────

interface DashboardData {
  jobs: {
    total: number;
    applied: number; working: number; left: number; rejected: number;
    inInterviewPipeline: number; planningToSwitch: number;
  };
  contracts: {
    total: number;
    pending: number; active: number; completed: number; cancelled: number;
    atRisk: number; pipelineValue: number; completedValue: number;
  };
  freelance: {
    total: number;
    bidding: number; in_progress: number; completed: number; lost: number;
    revisionRequested: number; totalEarnings: number; winRate: number | null; avgRate: number | null;
  };
  recentActivity: {
    id: string; kind: string; name: string; subtitle: string; type: string; createdAt: string;
  }[];
}

// ─── Range helpers ────────────────────────────────────────────────────────────

type RangePreset = "day" | "month" | "year" | "all" | "custom";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function presetRange(preset: Exclude<RangePreset, "custom" | "all">): { from: string; to: string } {
  const now = new Date();
  if (preset === "day") {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { from: toISODate(from), to: toISODate(to) };
  }
  if (preset === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toISODate(from), to: toISODate(to) };
  }
  // year
  const from = new Date(now.getFullYear(), 0, 1);
  const to   = new Date(now.getFullYear(), 11, 31);
  return { from: toISODate(from), to: toISODate(to) };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StageBarProps { label: string; count: number; total: number; barCls: string }

function StageBar({ label, count, total, barCls }: StageBarProps) {
  const p = pct(count, total);
  return (
    <div className="flex items-center gap-3">
      <span className="w-[80px] shrink-0 text-smoky7 text-[12px]">{label}</span>
      <div className="flex-1 h-[6px] rounded-full bg-smoky4 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barCls}`} style={{ width: `${p}%` }} />
      </div>
      <span className="w-[22px] text-right text-smoky9 text-[12px] font-semibold shrink-0">{count}</span>
      <span className="w-[30px] text-right text-smoky6 text-[11px] shrink-0">{p}%</span>
    </div>
  );
}

interface StatCardProps {
  label: string; value: string | number; sub: string; subHighlight?: boolean;
  accentCls: string; icon: React.ReactNode;
}

function StatCard({ label, value, sub, subHighlight, accentCls, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-smoky7 text-[12px] font-semibold uppercase tracking-wider leading-snug">{label}</p>
        <span className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${accentCls}`}>{icon}</span>
      </div>
      <div>
        <p className="text-smoky13 font-bold text-[36px] leading-none">{value}</p>
        <p className={`text-[12px] mt-2 ${subHighlight ? "text-blue500 font-medium" : "text-smoky6"}`}>{sub}</p>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string; total: number; href: string;
  bars: StageBarProps[];
  metrics: { label: string; value: string; sub: string }[];
}

function SectionCard({ title, total, href, bars, metrics }: SectionCardProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <p className="text-smoky13 font-bold text-[16px]">{title}</p>
        <Link href={href} className="text-blue500 text-[12px] font-medium hover:text-blue600 transition-colors">View all</Link>
      </div>
      <p className="text-smoky6 text-[12px] mb-5">
        {total === 0 ? "No entries yet" : `${total} total across all stages`}
      </p>
      <div className="flex flex-col gap-3 flex-1">
        {bars.map((b) => <StageBar key={b.label} {...b} />)}
      </div>
      <div className="mt-5 pt-5 border-t border-smoky4 grid grid-cols-2 gap-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-smoky6 text-[11px] uppercase tracking-wide mb-1">{m.label}</p>
            <p className="text-smoky13 font-bold text-[20px] leading-none">{m.value}</p>
            <p className="text-smoky6 text-[11px] mt-1">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const jobsIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M1 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const workingIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 15c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const contractIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 2h7l3 3v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M11 2v4h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const freelanceIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 13l3-3 2.5 2.5L13 7l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 7h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Stage/kind badge maps ────────────────────────────────────────────────────

const JOB_STAGE_CLS: Record<string, string> = {
  applied: "bg-blue50 text-blue700", working: "bg-success/10 text-success",
  left: "bg-smoky4 text-smoky7",     rejected: "bg-error/10 text-error",
};
const CONTRACT_STAGE_CLS: Record<string, string> = {
  pending: "bg-yellow100 text-yellow500", active: "bg-success/10 text-success",
  completed: "bg-blue50 text-blue700",    cancelled: "bg-error/10 text-error",
};
const FREELANCE_STAGE_CLS: Record<string, string> = {
  bidding: "bg-yellow100 text-yellow500", in_progress: "bg-blue50 text-blue700",
  completed: "bg-success/10 text-success", lost: "bg-error/10 text-error",
};
const STAGE_LABEL: Record<string, Record<string, string>> = {
  job:       { applied: "Applied", working: "Working", left: "Left", rejected: "Rejected" },
  contract:  { pending: "Pending", active: "Active", completed: "Completed", cancelled: "Cancelled" },
  freelance: { bidding: "Bidding", in_progress: "In Progress", completed: "Completed", lost: "Lost" },
};
const KIND_LABEL: Record<string, string> = { job: "Job", contract: "Contract", freelance: "Freelance" };
const KIND_CLS: Record<string, string>   = {
  job: "bg-smoky4 text-smoky8", contract: "bg-blue50 text-blue700", freelance: "bg-yellow100 text-yellow500",
};

const DATE_INPUT_CLS = "rounded-[10px] outline outline-1 outline-smoky5 px-3 py-1.5 text-[13px] text-smoky13 focus:outline-blue500 transition-all bg-white";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [preset, setPreset]       = useState<RangePreset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");

  const { from, to } = useMemo((): { from: string; to: string } => {
    if (preset === "all")    return { from: "", to: "" };
    if (preset === "custom") return { from: customFrom, to: customTo };
    return presetRange(preset);
  }, [preset, customFrom, customTo]);

  const swrKey = useMemo(() => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to)   params.set("to", to);
    const qs = params.toString();
    return `/api/dashboard${qs ? `?${qs}` : ""}`;
  }, [from, to]);

  const { data, isLoading } = useSWR<{ data: DashboardData }>(swrKey, authedFetcher);
  const d = data?.data;

  const PRESETS: { value: RangePreset; label: string }[] = [
    { value: "all",    label: "All Time" },
    { value: "day",    label: "Today" },
    { value: "month",  label: "This Month" },
    { value: "year",   label: "This Year" },
    { value: "custom", label: "Custom" },
  ];

  const rangeLabel = useMemo(() => {
    if (preset === "all")    return "all time";
    if (preset === "day")    return "today";
    if (preset === "month")  return "this month";
    if (preset === "year")   return "this year";
    if (customFrom && customTo) return `${formatDate(customFrom)} – ${formatDate(customTo)}`;
    if (customFrom) return `from ${formatDate(customFrom)}`;
    if (customTo)   return `until ${formatDate(customTo)}`;
    return "custom range";
  }, [preset, customFrom, customTo]);

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <span className="font-bold text-smoky13 text-[22px]">Dashboard<span className="text-blue500">.</span></span>

        {/* Range selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-smoky3 rounded-[12px] p-1">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors ${
                  preset === p.value
                    ? "bg-white text-smoky13 shadow-[0px_1px_4px_0px] shadow-smoky13/10"
                    : "text-smoky7 hover:text-smoky13"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className={DATE_INPUT_CLS}
              />
              <span className="text-smoky6 text-[12px]">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className={DATE_INPUT_CLS}
              />
            </div>
          )}
        </div>
      </div>

      {/* Loading / empty */}
      {(isLoading && !d) ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-smoky6 text-[15px]">Loading...</p>
        </div>
      ) : !d ? null : (() => {
        const { jobs, contracts, freelance, recentActivity } = d;
        const interviewRate = pct(jobs.inInterviewPipeline, jobs.applied);

        return (
          <div className="p-8 flex flex-col gap-6">

            {/* Range label */}
            <p className="text-smoky6 text-[13px] -mb-2">
              Showing data for <span className="text-smoky9 font-medium">{rangeLabel}</span>
              {d.jobs.total + d.contracts.total + d.freelance.total === 0 && (
                <span className="ml-2 text-smoky5">— no entries in this period</span>
              )}
            </p>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="Open Applications"
                value={jobs.applied}
                sub={
                  jobs.applied === 0 ? "No active applications" :
                  jobs.inInterviewPipeline > 0 ? `${jobs.inInterviewPipeline} in interview pipeline` :
                  "None past initial stage yet"
                }
                subHighlight={jobs.inInterviewPipeline > 0}
                accentCls="bg-blue50 text-blue500"
                icon={jobsIcon}
              />
              <StatCard
                label="Currently Working"
                value={jobs.working}
                sub={
                  jobs.working === 0 ? "Not employed anywhere" :
                  jobs.planningToSwitch > 0 ? `${jobs.planningToSwitch} planning to switch` :
                  "All comfortable"
                }
                accentCls="bg-success/10 text-success"
                icon={workingIcon}
              />
              <StatCard
                label="Active Contracts"
                value={contracts.active}
                sub={
                  contracts.active === 0 ? "No active contracts" :
                  contracts.atRisk > 0 ? `${contracts.atRisk} marked at risk` :
                  "All on track"
                }
                accentCls="bg-yellow100 text-yellow500"
                icon={contractIcon}
              />
              <StatCard
                label="Freelance Running"
                value={freelance.in_progress}
                sub={
                  freelance.in_progress === 0 ? "No active projects" :
                  freelance.revisionRequested > 0 ? `${freelance.revisionRequested} revision requested` :
                  "All on track"
                }
                accentCls="bg-blue50 text-blue700"
                icon={freelanceIcon}
              />
            </div>

            {/* ── Section overview row ── */}
            <div className="grid grid-cols-3 gap-4">

              <SectionCard
                title="Jobs"
                total={jobs.total}
                href="/dashboard/jobs/applied"
                bars={[
                  { label: "Applied",  count: jobs.applied,  total: jobs.total, barCls: "bg-blue500" },
                  { label: "Working",  count: jobs.working,  total: jobs.total, barCls: "bg-success" },
                  { label: "Left",     count: jobs.left,     total: jobs.total, barCls: "bg-smoky6"  },
                  { label: "Rejected", count: jobs.rejected, total: jobs.total, barCls: "bg-error"   },
                ]}
                metrics={[
                  {
                    label: "Interview Rate",
                    value: jobs.applied === 0 ? "—" : `${interviewRate}%`,
                    sub: jobs.applied === 0 ? "no applications yet" : `${jobs.inInterviewPipeline} of ${jobs.applied} applied`,
                  },
                  {
                    label: "Historical",
                    value: String(jobs.left + jobs.rejected),
                    sub: `${jobs.left} left · ${jobs.rejected} rejected`,
                  },
                ]}
              />

              <SectionCard
                title="Contracts"
                total={contracts.total}
                href="/dashboard/contracts/pending"
                bars={[
                  { label: "Pending",   count: contracts.pending,   total: contracts.total, barCls: "bg-yellow500" },
                  { label: "Active",    count: contracts.active,    total: contracts.total, barCls: "bg-success"   },
                  { label: "Completed", count: contracts.completed, total: contracts.total, barCls: "bg-blue500"   },
                  { label: "Cancelled", count: contracts.cancelled, total: contracts.total, barCls: "bg-error"     },
                ]}
                metrics={[
                  {
                    label: "Pipeline Value",
                    value: contracts.pipelineValue > 0 ? `$${contracts.pipelineValue.toLocaleString()}` : "—",
                    sub: "pending + active contracts",
                  },
                  {
                    label: "Total Earned",
                    value: contracts.completedValue > 0 ? `$${contracts.completedValue.toLocaleString()}` : "—",
                    sub: `from ${contracts.completed} completed`,
                  },
                ]}
              />

              <SectionCard
                title="Freelance"
                total={freelance.total}
                href="/dashboard/freelance/bidding"
                bars={[
                  { label: "Bidding",     count: freelance.bidding,     total: freelance.total, barCls: "bg-yellow500" },
                  { label: "In Progress", count: freelance.in_progress, total: freelance.total, barCls: "bg-blue500"   },
                  { label: "Completed",   count: freelance.completed,   total: freelance.total, barCls: "bg-success"   },
                  { label: "Lost",        count: freelance.lost,        total: freelance.total, barCls: "bg-error"     },
                ]}
                metrics={[
                  {
                    label: "Win Rate",
                    value: freelance.winRate !== null ? `${freelance.winRate}%` : "—",
                    sub: `${freelance.completed} won · ${freelance.lost} lost`,
                  },
                  {
                    label: "Total Earned",
                    value: freelance.totalEarnings > 0 ? `$${freelance.totalEarnings.toLocaleString()}` : "—",
                    sub: freelance.avgRate !== null ? `avg $${freelance.avgRate}/hr` : "no rate data",
                  },
                ]}
              />
            </div>

            {/* ── Recent Activity ── */}
            <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] overflow-hidden">
              <div className="px-6 py-5 border-b border-smoky4 flex items-center justify-between">
                <p className="text-smoky13 font-bold text-[16px]">Recent Activity</p>
                <p className="text-smoky6 text-[12px]">Last {recentActivity.length} entries added</p>
              </div>

              {recentActivity.length === 0 ? (
                <div className="flex items-center justify-center h-[160px]">
                  <p className="text-smoky6 text-[14px]">Nothing added yet.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-smoky4">
                      <th className="text-left text-[11px] font-semibold text-smoky7 uppercase tracking-wide px-6 py-3 w-[90px]">Type</th>
                      <th className="text-left text-[11px] font-semibold text-smoky7 uppercase tracking-wide px-6 py-3">Name</th>
                      <th className="text-left text-[11px] font-semibold text-smoky7 uppercase tracking-wide px-6 py-3">Details</th>
                      <th className="text-left text-[11px] font-semibold text-smoky7 uppercase tracking-wide px-6 py-3 w-[110px]">Stage</th>
                      <th className="text-left text-[11px] font-semibold text-smoky7 uppercase tracking-wide px-6 py-3 w-[100px]">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((item, i) => {
                      const href =
                        item.kind === "job"      ? `/dashboard/jobs/${item.id}` :
                        item.kind === "contract" ? `/dashboard/contracts/${item.id}` :
                        `/dashboard/freelance/${item.id}`;
                      const stageCls =
                        item.kind === "job"      ? (JOB_STAGE_CLS[item.type] ?? "bg-smoky4 text-smoky7") :
                        item.kind === "contract" ? (CONTRACT_STAGE_CLS[item.type] ?? "bg-smoky4 text-smoky7") :
                        (FREELANCE_STAGE_CLS[item.type] ?? "bg-smoky4 text-smoky7");
                      const stageLabel = STAGE_LABEL[item.kind]?.[item.type] ?? item.type;
                      return (
                        <tr key={`${item.kind}-${item.id}`}
                          onClick={() => router.push(href)}
                          className={`border-b border-smoky4 last:border-0 cursor-pointer hover:bg-blue50 transition-colors ${i % 2 === 1 ? "bg-smoky2" : ""}`}>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${KIND_CLS[item.kind]}`}>
                              {KIND_LABEL[item.kind]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[14px] text-smoky13 font-medium">{item.name}</td>
                          <td className="px-6 py-4 text-[13px] text-smoky7">{item.subtitle}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${stageCls}`}>
                              {stageLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-smoky6">
                            {formatDate(item.createdAt.slice(0, 10))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        );
      })()}
    </div>
  );
}
