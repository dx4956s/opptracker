"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DatePicker from "@/components/ui/DatePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DatePopup from "@/components/ui/DatePopup";
import ActiveTransitionPopup from "@/components/dashboard/contracts/ActiveTransitionPopup";
import ContractCompletedPopup, { CompletionBadge } from "@/components/dashboard/contracts/ContractCompletedPopup";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { formatDate, daysSince, daysBetween } from "@/lib/dateUtils";
import { inputCls, thCls, tdCls, tdMutedCls } from "@/lib/styles";
import Toggle from "@/components/ui/Toggle";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { authedFetcher, apiFetch } from "@/lib/fetcher";
import {
  ContractType, ContractStatus, DurationUnit, TypeTransitionOptions,
  PENDING_STATUSES, ACTIVE_STATUSES, CANCELLED_STATUSES,
  CONTRACT_TYPES, DURATION_UNITS, Contract,
  CONTRACT_STATUS_LABEL, CONTRACT_STATUS_BADGE_CLS,
} from "@/store/contractStore";

const PAGE_LIMIT = 10;

interface Props { type: ContractType; title: string }

// ─── Add Contract Modal ───────────────────────────────────────────────────────

function AddContractModal({ type, onAdded, onClose }: { type: ContractType; onAdded: () => void; onClose: () => void }) {
  const [client, setClient]                       = useState("");
  const [title, setTitle]                         = useState("");
  const [description, setDescription]             = useState("");
  const [currency, setCurrency]                   = useState("");
  const [contractValue, setContractValue]         = useState("");
  const [valueInDiscussion, setValueInDiscussion] = useState(false);
  const [durationValue, setDurationValue]         = useState("");
  const [durationUnit, setDurationUnit]           = useState<DurationUnit>("months");
  const [durationInDiscussion, setDurationInDiscussion] = useState(false);
  const [proposedOn, setProposedOn]               = useState("");
  const [saving, setSaving]                       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !title || saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/contracts", {
        method: "POST",
        json: {
          client, title, description,
          workingHours: "", rating: null, positiveReviews: "", negativeReviews: "",
          links: [], notes: "",
          currency, contractValue: valueInDiscussion ? "" : contractValue, valueInDiscussion,
          durationValue: durationInDiscussion ? "" : durationValue, durationUnit, durationInDiscussion,
          completionStatus: null,
          type, status: type === "pending" ? "no_response" : null,
          proposedOn: proposedOn || null, startDate: null, endDate: null, cancelledDate: null,
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
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Add Contract</h3>
        <p className="text-smoky7 text-[14px] mb-6">Add a new entry to {CONTRACT_TYPES.find((t) => t.value === type)?.label}.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Client Name</label>
            <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Acme Corp" className={inputCls} />
          </div>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Project / Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Redesign" className={inputCls} />
          </div>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the contract scope..." rows={3}
              className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-smoky8 text-[13px] font-medium">Contract Value</label>
              <Toggle checked={valueInDiscussion} onChange={setValueInDiscussion} label="In discussion" />
            </div>
            {!valueInDiscussion ? (
              <CurrencyInput currency={currency} onCurrencyChange={setCurrency}
                value={contractValue} onValueChange={setContractValue} valuePlaceholder="e.g. 5,000" />
            ) : (
              <div className="rounded-[12px] outline outline-1 outline-smoky4 px-4 py-3 text-[14px] text-smoky6 bg-smoky3">Value in discussion</div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-smoky8 text-[13px] font-medium">Duration</label>
              <Toggle checked={durationInDiscussion} onChange={setDurationInDiscussion} label="In discussion" />
            </div>
            {!durationInDiscussion ? (
              <div className="flex gap-2">
                <input type="text" value={durationValue} onChange={(e) => setDurationValue(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 3"
                  className={`${inputCls} w-[100px]`} />
                <div className="flex-1">
                  <CustomSelect options={DURATION_UNITS} value={durationUnit} onChange={(v) => setDurationUnit(v as DurationUnit)} variant="input" />
                </div>
              </div>
            ) : (
              <div className="rounded-[12px] outline outline-1 outline-smoky4 px-4 py-3 text-[14px] text-smoky6 bg-smoky3">Duration in discussion</div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Proposed On</label>
            <DatePicker value={proposedOn} onChange={setProposedOn} placeholder="Pick a date" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:opacity-50 text-white text-[14px] font-bold transition-colors">
              {saving ? "Adding..." : "Add Contract"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Row actions ──────────────────────────────────────────────────────────────

type PendingConfirm =
  | { kind: "status"; status: ContractStatus; label: string }
  | { kind: "type"; type: ContractType; label: string; opts?: TypeTransitionOptions }
  | { kind: "delete" };

function RowActions({ contract, onMutate }: { contract: Contract; onMutate: () => void }) {
  const [pendingDate, setPendingDate]                 = useState<ContractType | null>(null);
  const [pendingConfirm, setPendingConfirm]           = useState<PendingConfirm | null>(null);
  const [showActiveTransition, setShowActiveTransition] = useState(false);
  const [showCompletedPopup, setShowCompletedPopup]   = useState(false);

  const canChangeStatus = contract.type === "pending" || contract.type === "active" || contract.type === "cancelled";
  const statusOptions =
    contract.type === "pending"   ? PENDING_STATUSES :
    contract.type === "active"    ? ACTIVE_STATUSES :
    contract.type === "cancelled" ? CANCELLED_STATUSES : [];

  function handleStatusSelect(value: string) {
    const status = value as ContractStatus;
    setPendingConfirm({ kind: "status", status, label: CONTRACT_STATUS_LABEL[status] ?? status });
  }

  function handleTypeSelect(value: string) {
    const t = value as ContractType;
    const label = CONTRACT_TYPES.find((x) => x.value === t)?.label ?? t;
    if (t === "pending")   setPendingConfirm({ kind: "type", type: t, label });
    else if (t === "active")    setShowActiveTransition(true);
    else if (t === "completed") setShowCompletedPopup(true);
    else setPendingDate(t); // cancelled
  }

  async function handleDateConfirm(date: string) {
    if (!pendingDate) return;
    const type = pendingDate;
    setPendingDate(null);
    try {
      await apiFetch(`/api/contracts/${contract.id}/type`, { method: "PATCH", json: { type, date } });
      onMutate();
    } catch {
      // silently fail — table will not refresh
    }
  }

  async function handleConfirm() {
    if (!pendingConfirm) return;
    try {
      if (pendingConfirm.kind === "status") {
        await apiFetch(`/api/contracts/${contract.id}/status`, { method: "PATCH", json: { status: pendingConfirm.status } });
      } else if (pendingConfirm.kind === "type") {
        await apiFetch(`/api/contracts/${contract.id}/type`, { method: "PATCH", json: { type: pendingConfirm.type, ...pendingConfirm.opts } });
      } else if (pendingConfirm.kind === "delete") {
        await apiFetch(`/api/contracts/${contract.id}`, { method: "DELETE" });
      }
      onMutate();
    } finally {
      setPendingConfirm(null);
    }
  }

  const datePopupProps = pendingDate === "cancelled"
    ? { title: "Cancelled Date", label: "When was this contract cancelled?" }
    : null;

  const confirmProps: { title: string; message: string; confirmLabel: string; danger?: boolean } | null = pendingConfirm
    ? pendingConfirm.kind === "status"
      ? { title: "Change Status", message: `Set status to "${pendingConfirm.label}"?`, confirmLabel: "Change" }
      : pendingConfirm.kind === "type"
      ? { title: "Move Contract", message: `Move this contract to ${pendingConfirm.label}?`, confirmLabel: "Move" }
      : { title: "Delete Contract", message: `Delete ${contract.client} — ${contract.title}? This cannot be undone.`, confirmLabel: "Delete", danger: true }
    : null;

  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        {canChangeStatus && (
          <CustomSelect placeholder="Status" options={statusOptions} onChange={handleStatusSelect} header="Set Status" variant="button" />
        )}
        <CustomSelect placeholder="Type" options={CONTRACT_TYPES.filter((t) => t.value !== contract.type)} onChange={handleTypeSelect} header="Set Type" variant="button" />
        <button onClick={() => setPendingConfirm({ kind: "delete" })}
          className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-error border border-error/30 hover:bg-error/5 transition-colors">
          Delete
        </button>
      </div>

      {showActiveTransition && (
        <ActiveTransitionPopup contract={contract}
          onConfirm={async (opts) => {
            await apiFetch(`/api/contracts/${contract.id}/type`, { method: "PATCH", json: { type: "active", ...opts } });
            setShowActiveTransition(false);
            onMutate();
          }}
          onClose={() => setShowActiveTransition(false)} />
      )}
      {showCompletedPopup && (
        <ContractCompletedPopup contract={contract}
          onConfirm={async (opts) => {
            await apiFetch(`/api/contracts/${contract.id}/type`, { method: "PATCH", json: { type: "completed", ...opts } });
            setShowCompletedPopup(false);
            onMutate();
          }}
          onClose={() => setShowCompletedPopup(false)} />
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

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const PENDING_FILTER_TABS   = [{ value: null, label: "All" }, ...PENDING_STATUSES.map((s)   => ({ value: s.value as ContractStatus | null, label: s.label }))];
const ACTIVE_FILTER_TABS    = [{ value: null, label: "All" }, ...ACTIVE_STATUSES.map((s)    => ({ value: s.value as ContractStatus | null, label: s.label }))];
const CANCELLED_FILTER_TABS = [{ value: null, label: "All" }, ...CANCELLED_STATUSES.map((s) => ({ value: s.value as ContractStatus | null, label: s.label }))];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ContractsTable({ type, title }: Props) {
  const router = useRouter();

  const [page, setPage]                   = useState(1);
  const [search, setSearch]               = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter]   = useState<ContractStatus | null>(null);
  const [showAdd, setShowAdd]             = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const filterTabs =
    type === "pending"   ? PENDING_FILTER_TABS :
    type === "active"    ? ACTIVE_FILTER_TABS :
    type === "cancelled" ? CANCELLED_FILTER_TABS : null;

  const swrKey = `/api/contracts?type=${type}&page=${page}&limit=${PAGE_LIMIT}&search=${encodeURIComponent(debouncedSearch)}${statusFilter ? `&status=${statusFilter}` : ""}`;

  const { data, mutate, isLoading } = useSWR<{ data: Contract[]; total: number; page: number; pages: number; limit: number }>(
    swrKey, authedFetcher, { keepPreviousData: true }
  );

  const contracts = data?.data ?? [];
  const total     = data?.total ?? 0;
  const pages     = data?.pages ?? 1;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <span className="font-bold text-smoky13 text-[22px]">
          Contracts <span className="text-smoky6 font-normal text-[18px]">/</span>{" "}
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
          {type === "pending" && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Add Contract
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
          {isLoading && contracts.length === 0 ? (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-smoky6 text-[15px]">Loading...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex items-center justify-center h-[240px]">
              <p className="text-smoky6 text-[15px]">No {title.toLowerCase()} contracts yet.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-smoky4">
                    <th className={thCls}>Client</th>
                    <th className={thCls}>Title</th>
                    <th className={thCls}>Value</th>
                    <th className={thCls}>Duration</th>
                    {type === "pending" && (
                      <>
                        <th className={thCls}>Proposed On</th>
                        <th className={thCls}>Days Since Proposed</th>
                      </>
                    )}
                    {type === "active" && (
                      <>
                        <th className={thCls}>Start Date</th>
                        <th className={thCls}>Active Since</th>
                      </>
                    )}
                    {type === "completed" && (
                      <>
                        <th className={thCls}>Start Date</th>
                        <th className={thCls}>End Date</th>
                        <th className={thCls}>Actual Duration</th>
                        <th className={thCls}>Performance</th>
                      </>
                    )}
                    {type === "cancelled" && <th className={thCls}>Cancelled On</th>}
                    {(type === "pending" || type === "active" || type === "cancelled") && <th className={thCls}>Status</th>}
                    <th className="px-6 py-4 w-[220px]" />
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract, i) => (
                    <tr key={contract.id}
                      onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                      className={`border-b border-smoky4 last:border-b-0 cursor-pointer hover:bg-blue50 transition-colors ${i % 2 === 1 ? "bg-smoky2" : ""}`}>
                      <td className="px-6 py-4 text-[14px] text-smoky13 font-medium">{contract.client}</td>
                      <td className="px-6 py-4 text-[14px] text-smoky9">{contract.title}</td>
                      <td className="px-6 py-4 text-[14px] text-smoky9">
                        {contract.valueInDiscussion
                          ? <span className="text-smoky6 italic text-[13px]">In discussion</span>
                          : contract.contractValue
                          ? <span>{contract.currency && <span className="text-smoky6 text-[12px] font-medium mr-1">{contract.currency}</span>}{contract.contractValue}</span>
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-smoky9">
                        {contract.durationInDiscussion
                          ? <span className="text-smoky6 italic text-[13px]">In discussion</span>
                          : contract.durationValue
                          ? <span>{contract.durationValue} <span className="text-smoky6">{contract.durationValue === "1" ? contract.durationUnit.replace(/s$/, "") : contract.durationUnit}</span></span>
                          : "—"}
                      </td>
                      {type === "pending" && (
                        <>
                          <td className={tdCls}>{formatDate(contract.proposedOn)}</td>
                          <td className={tdMutedCls}>{daysSince(contract.proposedOn)}</td>
                        </>
                      )}
                      {type === "active" && (
                        <>
                          <td className={tdCls}>{formatDate(contract.startDate)}</td>
                          <td className={tdMutedCls}>{daysSince(contract.startDate)}</td>
                        </>
                      )}
                      {type === "completed" && (
                        <>
                          <td className={tdCls}>{formatDate(contract.startDate)}</td>
                          <td className={tdCls}>{formatDate(contract.endDate)}</td>
                          <td className={tdMutedCls}>{daysBetween(contract.startDate, contract.endDate)}</td>
                          <td className="px-6 py-4"><CompletionBadge status={contract.completionStatus} /></td>
                        </>
                      )}
                      {type === "cancelled" && <td className={tdCls}>{formatDate(contract.cancelledDate)}</td>}
                      {(type === "pending" || type === "active" || type === "cancelled") && (
                        <td className="px-6 py-4"><StatusBadge status={contract.status} labels={CONTRACT_STATUS_LABEL} classes={CONTRACT_STATUS_BADGE_CLS} /></td>
                      )}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <RowActions contract={contract} onMutate={() => mutate()} />
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

      {showAdd && <AddContractModal type={type} onAdded={() => mutate()} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
