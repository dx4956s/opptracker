"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DatePicker from "@/components/ui/DatePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DatePopup from "@/components/ui/DatePopup";
import WorkingTransitionPopup from "@/components/dashboard/jobs/WorkingTransitionPopup";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { formatDate, daysSince, daysBetween } from "@/lib/dateUtils";
import { thCls, tdCls, tdMutedCls } from "@/lib/styles";
import Toggle from "@/components/ui/Toggle";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { authedFetcher, apiFetch } from "@/lib/fetcher";
import {
  JobType, JobStatus, JobTypeTransitionOptions,
  APPLIED_STATUSES, WORKING_STATUSES, REJECTED_STATUSES,
  JOB_TYPES, Job, JOB_STATUS_LABEL, JOB_STATUS_BADGE_CLS,
} from "@/store/jobStore";

const PAGE_LIMIT = 10;

interface Props { type: JobType; title: string }

// ─── Add Job Modal ────────────────────────────────────────────────────────────

function AddJobModal({ type, onAdded, onClose }: { type: JobType; onAdded: () => void; onClose: () => void }) {
  const [company, setCompany]             = useState("");
  const [role, setRole]                   = useState("");
  const [description, setDescription]     = useState("");
  const [currency, setCurrency]           = useState("");
  const [expectedPackage, setExpectedPackage] = useState("");
  const [salaryInDiscussion, setSalaryInDiscussion] = useState(false);
  const [appliedOn, setAppliedOn]         = useState("");
  const [saving, setSaving]               = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company || !role || saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/jobs", {
        method: "POST",
        json: {
          company, role, description, currency,
          expectedPackage: salaryInDiscussion ? "" : expectedPackage,
          salaryInDiscussion,
          type, status: type === "applied" ? "no_callback" : null,
          appliedOn: appliedOn || null,
          workingHours: "", rating: null,
          positiveReviews: "", negativeReviews: "",
          startDate: null, endDate: null, rejectedDate: null,
          links: [], notes: "",
        },
      });
      onAdded();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[440px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Add Job</h3>
        <p className="text-smoky7 text-[14px] mb-6">
          Add a new entry to {JOB_TYPES.find((t) => t.value === type)?.label}.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Company Name</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp"
              className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all" />
          </div>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Role</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Engineer"
              className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all" />
          </div>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Job Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Paste or summarise..." rows={3}
              className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-smoky8 text-[13px] font-medium">Expected Package <span className="text-smoky6 font-normal">/yr</span></label>
              <Toggle checked={salaryInDiscussion} onChange={setSalaryInDiscussion} label="In discussion" />
            </div>
            {!salaryInDiscussion
              ? <CurrencyInput currency={currency} onCurrencyChange={setCurrency} value={expectedPackage} onValueChange={setExpectedPackage} valuePlaceholder="e.g. 120,000" />
              : <div className="rounded-[12px] outline outline-1 outline-smoky4 px-4 py-3 text-[14px] text-smoky6 bg-smoky3">Salary in discussion</div>
            }
          </div>
          <div className="mb-6">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Applied On</label>
            <DatePicker value={appliedOn} onChange={setAppliedOn} placeholder="Pick a date" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:opacity-50 text-white text-[14px] font-bold transition-colors">
              {saving ? "Adding..." : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Row actions ──────────────────────────────────────────────────────────────

type PendingConfirm =
  | { kind: "status"; status: JobStatus; label: string }
  | { kind: "type"; type: JobType; label: string; opts?: JobTypeTransitionOptions }
  | { kind: "delete" };

function RowActions({ job, onMutate }: { job: Job; onMutate: () => void }) {
  const [pendingDate, setPendingDate]             = useState<JobType | null>(null);
  const [showWorkingTransition, setShowWorkingTransition] = useState(false);
  const [pendingConfirm, setPendingConfirm]       = useState<PendingConfirm | null>(null);

  const canChangeStatus = job.type === "applied" || job.type === "working" || job.type === "rejected";
  const statusOptions =
    job.type === "applied"  ? APPLIED_STATUSES :
    job.type === "working"  ? WORKING_STATUSES :
    job.type === "rejected" ? REJECTED_STATUSES : [];

  function handleStatusSelect(value: string) {
    const status = value as JobStatus;
    setPendingConfirm({ kind: "status", status, label: JOB_STATUS_LABEL[status] ?? status });
  }

  function handleTypeSelect(value: string) {
    const t = value as JobType;
    const label = JOB_TYPES.find((x) => x.value === t)?.label ?? t;
    if (t === "applied") setPendingConfirm({ kind: "type", type: t, label });
    else if (t === "working") setShowWorkingTransition(true);
    else setPendingDate(t);
  }

  async function handleDateConfirm(date: string) {
    if (!pendingDate) return;
    const type = pendingDate;
    setPendingDate(null);
    try {
      await apiFetch(`/api/jobs/${job.id}/type`, { method: "PATCH", json: { type, date } });
      onMutate();
    } catch {
      // silently fail — table will not refresh
    }
  }

  async function handleConfirm() {
    if (!pendingConfirm) return;
    try {
      if (pendingConfirm.kind === "status") {
        await apiFetch(`/api/jobs/${job.id}/status`, { method: "PATCH", json: { status: pendingConfirm.status } });
      } else if (pendingConfirm.kind === "type") {
        await apiFetch(`/api/jobs/${job.id}/type`, { method: "PATCH", json: { type: pendingConfirm.type, ...pendingConfirm.opts } });
      } else if (pendingConfirm.kind === "delete") {
        await apiFetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      }
      onMutate();
    } finally {
      setPendingConfirm(null);
    }
  }

  const datePopupProps = pendingDate === "left"
    ? { title: "End Date",      label: "When did you leave?" }
    : pendingDate === "rejected"
    ? { title: "Rejected Date", label: "When were you rejected?" }
    : null;

  const confirmProps: { title: string; message: string; confirmLabel: string; danger?: boolean } | null = pendingConfirm
    ? pendingConfirm.kind === "status"
      ? { title: "Change Status", message: `Set status to "${pendingConfirm.label}"?`, confirmLabel: "Change" }
      : pendingConfirm.kind === "type"
      ? { title: "Move Job",      message: `Move this job to ${pendingConfirm.label}?`, confirmLabel: "Move" }
      : { title: "Delete Job",    message: `Delete ${job.company} — ${job.role}? This cannot be undone.`, confirmLabel: "Delete", danger: true }
    : null;

  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        {canChangeStatus && (
          <CustomSelect placeholder="Status" options={statusOptions} onChange={handleStatusSelect} header="Set Status" variant="button" />
        )}
        <CustomSelect placeholder="Type" options={JOB_TYPES.filter((t) => t.value !== job.type)} onChange={handleTypeSelect} header="Set Type" variant="button" />
        <button onClick={() => setPendingConfirm({ kind: "delete" })}
          className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-error border border-error/30 hover:bg-error/5 transition-colors">
          Delete
        </button>
      </div>
      {showWorkingTransition && (
        <WorkingTransitionPopup job={job}
          onConfirm={async (opts) => {
            await apiFetch(`/api/jobs/${job.id}/type`, { method: "PATCH", json: { type: "working", ...opts } });
            setShowWorkingTransition(false);
            onMutate();
          }}
          onClose={() => setShowWorkingTransition(false)} />
      )}
      {pendingDate && datePopupProps && (
        <DatePopup title={datePopupProps.title} label={datePopupProps.label} onConfirm={handleDateConfirm} onClose={() => setPendingDate(null)} />
      )}
      {pendingConfirm && confirmProps && (
        <ConfirmModal {...confirmProps} onConfirm={handleConfirm} onClose={() => setPendingConfirm(null)} />
      )}
    </>
  );
}

// ─── Filter tabs helpers ──────────────────────────────────────────────────────

const APPLIED_FILTER_TABS  = [{ value: null, label: "All" }, ...APPLIED_STATUSES.map((s)  => ({ value: s.value as JobStatus | null, label: s.label }))];
const WORKING_FILTER_TABS  = [{ value: null, label: "All" }, ...WORKING_STATUSES.map((s)  => ({ value: s.value as JobStatus | null, label: s.label }))];
const REJECTED_FILTER_TABS = [{ value: null, label: "All" }, ...REJECTED_STATUSES.map((s) => ({ value: s.value as JobStatus | null, label: s.label }))];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function JobsTable({ type, title }: Props) {
  const router = useRouter();

  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | null>(null);
  const [showAdd, setShowAdd]         = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  const filterTabs =
    type === "applied"  ? APPLIED_FILTER_TABS :
    type === "working"  ? WORKING_FILTER_TABS :
    type === "rejected" ? REJECTED_FILTER_TABS : null;

  const swrKey = `/api/jobs?type=${type}&page=${page}&limit=${PAGE_LIMIT}&search=${encodeURIComponent(debouncedSearch)}${statusFilter ? `&status=${statusFilter}` : ""}`;

  const { data, mutate, isLoading } = useSWR<{ data: Job[]; total: number; page: number; pages: number; limit: number }>(
    swrKey, authedFetcher, { keepPreviousData: true }
  );

  const jobs  = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <span className="font-bold text-smoky13 text-[22px]">
          Jobs <span className="text-smoky6 font-normal text-[18px]">/</span>{" "}
          <span className="text-blue500">{title}</span><span className="text-blue500">.</span>
        </span>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-smoky6 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company..."
              className="pl-8 pr-3 py-2 rounded-[10px] outline outline-1 outline-smoky5 text-[13px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all w-[180px]" />
          </div>
          {type === "applied" && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Add Job
            </button>
          )}
        </div>
      </div>

      {/* Status filter bar */}
      {filterTabs && (
        <div className="bg-white border-t border-smoky4 px-8 py-3 flex items-center gap-2">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button key={String(tab.value)} onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors ${active ? "bg-blue500 text-white" : "text-smoky7 hover:bg-smoky3 hover:text-smoky13"}`}>
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="p-8">
        <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] overflow-hidden">
          {isLoading && jobs.length === 0 ? (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-smoky6 text-[15px]">Loading...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-smoky6 text-[15px]">No {title.toLowerCase()} jobs yet.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-smoky4">
                    <th className={thCls}>Company</th>
                    <th className={thCls}>Role</th>
                    <th className={thCls}>Expected Package</th>
                    {type === "applied"  && <><th className={thCls}>Applied On</th><th className={thCls}>Days Since Applied</th></>}
                    {type === "working"  && <><th className={thCls}>Start Date</th><th className={thCls}>Working Since</th></>}
                    {type === "left"     && <><th className={thCls}>Working From</th><th className={thCls}>Working To</th><th className={thCls}>Total Days</th></>}
                    {type === "rejected" && <th className={thCls}>Rejected On</th>}
                    {(type === "applied" || type === "working" || type === "rejected") && <th className={thCls}>Status</th>}
                    <th className="px-6 py-4 w-[220px]" />
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, i) => (
                    <tr key={job.id} onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                      className={`border-b border-smoky4 last:border-b-0 cursor-pointer hover:bg-blue50 transition-colors ${i % 2 === 1 ? "bg-smoky2" : ""}`}>
                      <td className="px-6 py-4 text-[14px] text-smoky13 font-medium">{job.company}</td>
                      <td className="px-6 py-4 text-[14px] text-smoky9">{job.role}</td>
                      <td className="px-6 py-4 text-[14px] text-smoky9">
                        {job.salaryInDiscussion
                          ? <span className="text-smoky6 italic text-[13px]">In discussion</span>
                          : job.expectedPackage
                          ? <span>{job.currency && <span className="text-smoky6 text-[12px] font-medium mr-1">{job.currency}</span>}{job.expectedPackage}</span>
                          : "—"}
                      </td>
                      {type === "applied"  && <><td className={tdCls}>{formatDate(job.appliedOn)}</td><td className={tdMutedCls}>{daysSince(job.appliedOn)}</td></>}
                      {type === "working"  && <><td className={tdCls}>{formatDate(job.startDate)}</td><td className={tdMutedCls}>{daysSince(job.startDate)}</td></>}
                      {type === "left"     && <><td className={tdCls}>{formatDate(job.startDate)}</td><td className={tdCls}>{formatDate(job.endDate)}</td><td className={tdMutedCls}>{daysBetween(job.startDate, job.endDate)}</td></>}
                      {type === "rejected" && <td className={tdCls}>{formatDate(job.rejectedDate)}</td>}
                      {(type === "applied" || type === "working" || type === "rejected") && (
                        <td className="px-6 py-4">
                          <StatusBadge status={job.status} labels={JOB_STATUS_LABEL} classes={JOB_STATUS_BADGE_CLS} />
                        </td>
                      )}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <RowActions job={job} onMutate={() => mutate()} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} pages={pages} total={total} limit={PAGE_LIMIT} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {showAdd && <AddJobModal type={type} onAdded={() => mutate()} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
