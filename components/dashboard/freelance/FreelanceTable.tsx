"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DatePicker from "@/components/ui/DatePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DatePopup from "@/components/ui/DatePopup";
import InProgressPopup from "@/components/dashboard/freelance/InProgressPopup";
import FreelanceCompletedPopup from "@/components/dashboard/freelance/FreelanceCompletedPopup";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { formatDate, daysSince } from "@/lib/dateUtils";
import { inputCls, thCls, tdCls, tdMutedCls } from "@/lib/styles";
import { authedFetcher, apiFetch } from "@/lib/fetcher";
import {
  FreelanceType, FreelanceStatus, FreelanceTypeTransitionOptions,
  BIDDING_STATUSES, IN_PROGRESS_STATUSES, LOST_STATUSES, FREELANCE_TYPES,
  Freelance, calcDuration, FREELANCE_STATUS_LABEL, FREELANCE_STATUS_BADGE_CLS,
} from "@/store/freelanceStore";

const PAGE_LIMIT = 10;

interface Props { type: FreelanceType; title: string }

// ─── Add Freelance Modal ──────────────────────────────────────────────────────

function AddFreelanceModal({ type, onAdded, onClose }: { type: FreelanceType; onAdded: () => void; onClose: () => void }) {
  const [client, setClient]           = useState("");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency]       = useState("");
  const [hourlyRate, setHourlyRate]   = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [bidDate, setBidDate]         = useState("");
  const [saving, setSaving]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !title || saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/freelance", {
        method: "POST",
        json: {
          client, title, description,
          rating: null, positiveReviews: "", negativeReviews: "",
          links: [], notes: "",
          currency, hourlyRate, hoursPerDay, totalEarnings: null,
          type,
          status: type === "bidding" ? "proposal_sent" : type === "in_progress" ? "on_track" : null,
          bidDate: bidDate || null, startDate: null, endDate: null, lostDate: null,
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
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[440px] p-8 max-h-[90vh] overflow-y-auto">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Add Freelance Project</h3>
        <p className="text-smoky7 text-[14px] mb-6">Add a new project to {FREELANCE_TYPES.find((t) => t.value === type)?.label}.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Client Name</label>
            <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Acme Corp" className={inputCls} />
          </div>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Project Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Redesign" className={inputCls} />
          </div>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the project scope..." rows={3}
              className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
          </div>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Hourly Rate & Hours/Day</label>
            <div className="flex gap-2">
              <div className="flex items-center rounded-[12px] outline outline-1 outline-smoky5 focus-within:outline-blue500 transition-all w-[170px] shrink-0">
                <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 5))}
                  placeholder="USD"
                  className="w-[52px] shrink-0 px-3 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 outline-none bg-transparent font-medium" />
                <span className="w-px self-stretch bg-smoky5 shrink-0" />
                <input type="text" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="/hr"
                  className="flex-1 px-3 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 outline-none bg-transparent" />
              </div>
              <input type="text" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="Hrs/day" className={`${inputCls} flex-1`} />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Bid Date</label>
            <DatePicker value={bidDate} onChange={setBidDate} placeholder="Pick a date" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:opacity-50 text-white text-[14px] font-bold transition-colors">
              {saving ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Row actions ──────────────────────────────────────────────────────────────

type PendingConfirm =
  | { kind: "status"; status: FreelanceStatus; label: string }
  | { kind: "type"; type: FreelanceType; label: string; opts?: FreelanceTypeTransitionOptions }
  | { kind: "delete" };

function RowActions({ freelance, onMutate }: { freelance: Freelance; onMutate: () => void }) {
  const [pendingConfirm, setPendingConfirm]           = useState<PendingConfirm | null>(null);
  const [showInProgressPopup, setShowInProgressPopup] = useState(false);
  const [showCompletedPopup, setShowCompletedPopup]   = useState(false);
  const [showLostPopup, setShowLostPopup]             = useState(false);

  const statusOptions =
    freelance.type === "bidding"     ? BIDDING_STATUSES :
    freelance.type === "in_progress" ? IN_PROGRESS_STATUSES :
    freelance.type === "lost"        ? LOST_STATUSES : [];

  function handleStatusSelect(value: string) {
    const status = value as FreelanceStatus;
    setPendingConfirm({ kind: "status", status, label: FREELANCE_STATUS_LABEL[status] ?? status });
  }

  function handleTypeSelect(value: string) {
    const t = value as FreelanceType;
    const label = FREELANCE_TYPES.find((x) => x.value === t)?.label ?? t;
    if (t === "bidding")      setPendingConfirm({ kind: "type", type: t, label });
    else if (t === "in_progress") setShowInProgressPopup(true);
    else if (t === "completed")   setShowCompletedPopup(true);
    else if (t === "lost")        setShowLostPopup(true);
  }

  async function handleConfirm() {
    if (!pendingConfirm) return;
    try {
      if (pendingConfirm.kind === "status") {
        await apiFetch(`/api/freelance/${freelance.id}/status`, { method: "PATCH", json: { status: pendingConfirm.status } });
      } else if (pendingConfirm.kind === "type") {
        await apiFetch(`/api/freelance/${freelance.id}/type`, { method: "PATCH", json: { type: pendingConfirm.type, ...pendingConfirm.opts } });
      } else if (pendingConfirm.kind === "delete") {
        await apiFetch(`/api/freelance/${freelance.id}`, { method: "DELETE" });
      }
      onMutate();
    } finally {
      setPendingConfirm(null);
    }
  }

  const confirmProps: { title: string; message: string; confirmLabel: string; danger?: boolean } | null = pendingConfirm
    ? pendingConfirm.kind === "status"
      ? { title: "Change Status", message: `Set status to "${pendingConfirm.label}"?`, confirmLabel: "Change" }
      : pendingConfirm.kind === "type"
      ? { title: "Move Project", message: `Move this project to ${pendingConfirm.label}?`, confirmLabel: "Move" }
      : { title: "Delete Project", message: `Delete ${freelance.client} — ${freelance.title}? This cannot be undone.`, confirmLabel: "Delete", danger: true }
    : null;

  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        {statusOptions.length > 0 && (
          <CustomSelect placeholder="Status" options={statusOptions} onChange={handleStatusSelect} header="Set Status" variant="button" />
        )}
        <CustomSelect placeholder="Type" options={FREELANCE_TYPES.filter((t) => t.value !== freelance.type)} onChange={handleTypeSelect} header="Set Type" variant="button" />
        <button onClick={() => setPendingConfirm({ kind: "delete" })}
          className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-error border border-error/30 hover:bg-error/5 transition-colors">
          Delete
        </button>
      </div>

      {showInProgressPopup && (
        <InProgressPopup freelance={freelance}
          onConfirm={async (opts) => {
            await apiFetch(`/api/freelance/${freelance.id}/type`, { method: "PATCH", json: { type: "in_progress", ...opts } });
            setShowInProgressPopup(false);
            onMutate();
          }}
          onClose={() => setShowInProgressPopup(false)} />
      )}
      {showCompletedPopup && (
        <FreelanceCompletedPopup freelance={freelance}
          onConfirm={async (opts) => {
            await apiFetch(`/api/freelance/${freelance.id}/type`, { method: "PATCH", json: { type: "completed", ...opts } });
            setShowCompletedPopup(false);
            onMutate();
          }}
          onClose={() => setShowCompletedPopup(false)} />
      )}
      {showLostPopup && (
        <DatePopup title="Bid Lost" label="When did you find out?"
          onConfirm={async (date) => {
            await apiFetch(`/api/freelance/${freelance.id}/type`, { method: "PATCH", json: { type: "lost", date } });
            setShowLostPopup(false);
            onMutate();
          }}
          onClose={() => setShowLostPopup(false)} />
      )}
      {pendingConfirm && confirmProps && (
        <ConfirmModal {...confirmProps} onConfirm={handleConfirm} onClose={() => setPendingConfirm(null)} />
      )}
    </>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const BIDDING_FILTER_TABS     = [{ value: null, label: "All" }, ...BIDDING_STATUSES.map((s)     => ({ value: s.value as FreelanceStatus | null, label: s.label }))];
const IN_PROGRESS_FILTER_TABS = [{ value: null, label: "All" }, ...IN_PROGRESS_STATUSES.map((s) => ({ value: s.value as FreelanceStatus | null, label: s.label }))];
const LOST_FILTER_TABS        = [{ value: null, label: "All" }, ...LOST_STATUSES.map((s)        => ({ value: s.value as FreelanceStatus | null, label: s.label }))];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function FreelanceTable({ type, title }: Props) {
  const router = useRouter();

  const [page, setPage]                   = useState(1);
  const [search, setSearch]               = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter]   = useState<FreelanceStatus | null>(null);
  const [showAdd, setShowAdd]             = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const filterTabs =
    type === "bidding"     ? BIDDING_FILTER_TABS :
    type === "in_progress" ? IN_PROGRESS_FILTER_TABS :
    type === "lost"        ? LOST_FILTER_TABS : null;

  const swrKey = `/api/freelance?type=${type}&page=${page}&limit=${PAGE_LIMIT}&search=${encodeURIComponent(debouncedSearch)}${statusFilter ? `&status=${statusFilter}` : ""}`;

  const { data, mutate, isLoading } = useSWR<{ data: Freelance[]; total: number; page: number; pages: number; limit: number }>(
    swrKey, authedFetcher, { keepPreviousData: true }
  );

  const freelances = data?.data ?? [];
  const total      = data?.total ?? 0;
  const pages      = data?.pages ?? 1;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <span className="font-bold text-smoky13 text-[22px]">
          Freelance <span className="text-smoky6 font-normal text-[18px]">/</span>{" "}
          <span className="text-blue500">{title}</span><span className="text-blue500">.</span>
        </span>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-smoky6 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search client..."
              className="pl-8 pr-3 py-2 rounded-[10px] outline outline-1 outline-smoky5 text-[13px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all w-[180px]" />
          </div>
          {type === "bidding" && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Add Project
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
          {isLoading && freelances.length === 0 ? (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-smoky6 text-[15px]">Loading...</p>
            </div>
          ) : freelances.length === 0 ? (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-smoky6 text-[15px]">No {title.toLowerCase()} projects yet.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-smoky4">
                    <th className={thCls}>Client</th>
                    <th className={thCls}>Title</th>
                    <th className={thCls}>Rate/hr</th>
                    <th className={thCls}>Hrs/Day</th>
                    {type === "bidding" && (
                      <>
                        <th className={thCls}>Bid Date</th>
                        <th className={thCls}>Days Since</th>
                        <th className={thCls}>Status</th>
                      </>
                    )}
                    {type === "in_progress" && (
                      <>
                        <th className={thCls}>Start Date</th>
                        <th className={thCls}>Active Since</th>
                        <th className={thCls}>Status</th>
                      </>
                    )}
                    {type === "completed" && (
                      <>
                        <th className={thCls}>Start Date</th>
                        <th className={thCls}>Delivered</th>
                        <th className={thCls}>Duration</th>
                        <th className={thCls}>Total Earnings</th>
                      </>
                    )}
                    {type === "lost" && (
                      <>
                        <th className={thCls}>Bid Date</th>
                        <th className={thCls}>Lost On</th>
                        <th className={thCls}>Reason</th>
                      </>
                    )}
                    <th className="px-6 py-4 w-[220px]" />
                  </tr>
                </thead>
                <tbody>
                  {freelances.map((freelance, i) => {
                    const duration = calcDuration(freelance.startDate, freelance.endDate);
                    return (
                      <tr key={freelance.id}
                        onClick={() => router.push(`/dashboard/freelance/${freelance.id}`)}
                        className={`border-b border-smoky4 last:border-b-0 cursor-pointer hover:bg-blue50 transition-colors ${i % 2 === 1 ? "bg-smoky2" : ""}`}>
                        <td className="px-6 py-4 text-[14px] text-smoky13 font-medium">{freelance.client}</td>
                        <td className="px-6 py-4 text-[14px] text-smoky9">{freelance.title}</td>
                        <td className={tdCls}>
                          {freelance.hourlyRate
                            ? <span>{freelance.currency && <span className="text-smoky6 text-[12px] font-medium mr-1">{freelance.currency}</span>}{freelance.hourlyRate}<span className="text-smoky6">/hr</span></span>
                            : <span className="text-smoky6 text-[13px]">—</span>}
                        </td>
                        <td className={tdCls}>
                          {freelance.hoursPerDay
                            ? <span>{freelance.hoursPerDay} <span className="text-smoky6">hrs</span></span>
                            : <span className="text-smoky6 text-[13px]">—</span>}
                        </td>
                        {type === "bidding" && (
                          <>
                            <td className={tdCls}>{formatDate(freelance.bidDate)}</td>
                            <td className={tdMutedCls}>{daysSince(freelance.bidDate)}</td>
                            <td className="px-6 py-4"><StatusBadge status={freelance.status} labels={FREELANCE_STATUS_LABEL} classes={FREELANCE_STATUS_BADGE_CLS} /></td>
                          </>
                        )}
                        {type === "in_progress" && (
                          <>
                            <td className={tdCls}>{formatDate(freelance.startDate)}</td>
                            <td className={tdMutedCls}>{daysSince(freelance.startDate)}</td>
                            <td className="px-6 py-4"><StatusBadge status={freelance.status} labels={FREELANCE_STATUS_LABEL} classes={FREELANCE_STATUS_BADGE_CLS} /></td>
                          </>
                        )}
                        {type === "completed" && (
                          <>
                            <td className={tdCls}>{formatDate(freelance.startDate)}</td>
                            <td className={tdCls}>{formatDate(freelance.endDate)}</td>
                            <td className={tdMutedCls}>{duration !== null ? `${duration} day${duration !== 1 ? "s" : ""}` : "—"}</td>
                            <td className={tdCls}>
                              {freelance.totalEarnings
                                ? <span>{freelance.currency && <span className="text-smoky6 text-[12px] font-medium mr-1">{freelance.currency}</span>}{freelance.totalEarnings}</span>
                                : <span className="text-smoky6 text-[13px]">—</span>}
                            </td>
                          </>
                        )}
                        {type === "lost" && (
                          <>
                            <td className={tdCls}>{formatDate(freelance.bidDate)}</td>
                            <td className={tdCls}>{formatDate(freelance.lostDate)}</td>
                            <td className="px-6 py-4"><StatusBadge status={freelance.status} labels={FREELANCE_STATUS_LABEL} classes={FREELANCE_STATUS_BADGE_CLS} /></td>
                          </>
                        )}
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <RowActions freelance={freelance} onMutate={() => mutate()} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination page={page} pages={pages} total={total} limit={PAGE_LIMIT} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {showAdd && <AddFreelanceModal type={type} onAdded={() => mutate()} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
