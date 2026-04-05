"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DatePicker from "@/components/ui/DatePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DatePopup from "@/components/ui/DatePopup";
import ActiveTransitionPopup from "@/components/dashboard/contracts/ActiveTransitionPopup";
import ContractCompletedPopup, { COMPLETION_CONFIG } from "@/components/dashboard/contracts/ContractCompletedPopup";
import NotesTab from "@/components/dashboard/shared/NotesTab";
import LinksTab, { LinkItem } from "@/components/dashboard/shared/LinksTab";
import { inputCls, labelCls } from "@/lib/styles";
import { RATING_OPTIONS } from "@/lib/constants";
import Toggle from "@/components/ui/Toggle";
import CurrencyInput from "@/components/ui/CurrencyInput";
import DeleteButton from "@/components/ui/DeleteButton";
import TabBar from "@/components/ui/TabBar";
import Snackbar from "@/components/ui/Snackbar";
import { authedFetcher, apiFetch } from "@/lib/fetcher";
import {
  ContractType, ContractStatus, DurationUnit, TypeTransitionOptions,
  PENDING_STATUSES, ACTIVE_STATUSES, CANCELLED_STATUSES,
  CONTRACT_TYPES, DURATION_UNITS, Contract, CONTRACT_STATUS_LABEL,
} from "@/store/contractStore";

interface Props { id: string }

export default function ContractDetail({ id }: Props) {
  const router = useRouter();

  const { data, mutate } = useSWR<{ data: Contract }>(`/api/contracts/${id}`, authedFetcher);
  const contract = data?.data;

  const [tab, setTab] = useState<"description" | "files" | "notes">("description");

  const [client, setClient]                         = useState("");
  const [title, setTitle]                           = useState("");
  const [description, setDescription]               = useState("");
  const [workingHours, setWorkingHours]             = useState("");
  const [rating, setRating]                         = useState<number | null>(null);
  const [positiveReviews, setPositiveReviews]       = useState("");
  const [negativeReviews, setNegativeReviews]       = useState("");
  const [currency, setCurrency]                     = useState("");
  const [contractValue, setContractValue]           = useState("");
  const [valueInDiscussion, setValueInDiscussion]   = useState(false);
  const [durationValue, setDurationValue]           = useState("");
  const [durationUnit, setDurationUnit]             = useState<DurationUnit>("months");
  const [durationInDiscussion, setDurationInDiscussion] = useState(false);
  const [proposedOn, setProposedOn]                 = useState("");
  const [startDate, setStartDate]                   = useState("");
  const [endDate, setEndDate]                       = useState("");
  const [cancelledDate, setCancelledDate]           = useState("");
  const [links, setLinks]                           = useState<LinkItem[]>([]);
  const [notes, setNotes]                           = useState("");

  const [showActiveTransition, setShowActiveTransition] = useState(false);
  const [showCompletedPopup, setShowCompletedPopup]     = useState(false);
  const [pendingCancelledDate, setPendingCancelledDate] = useState(false);
  const [pendingTypeConfirm, setPendingTypeConfirm]     = useState<{ type: ContractType; opts: TypeTransitionOptions } | null>(null);
  const [pendingStatusConfirm, setPendingStatusConfirm] = useState<ContractStatus | null>(null);
  const [showSaveConfirm, setShowSaveConfirm]           = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm]       = useState(false);
  const [snackbar, setSnackbar]                         = useState<{ variant: "success" | "error"; message: string } | null>(null);
  function showSnack(v: "success" | "error", msg: string) { setSnackbar({ variant: v, message: msg }); }

  useEffect(() => {
    if (!contract) return;
    setClient(contract.client); setTitle(contract.title); setDescription(contract.description);
    setWorkingHours(contract.workingHours); setRating(contract.rating);
    setPositiveReviews(contract.positiveReviews); setNegativeReviews(contract.negativeReviews);
    setCurrency(contract.currency); setContractValue(contract.contractValue);
    setValueInDiscussion(contract.valueInDiscussion);
    setDurationValue(contract.durationValue); setDurationUnit(contract.durationUnit);
    setDurationInDiscussion(contract.durationInDiscussion);
    setProposedOn(contract.proposedOn ?? ""); setStartDate(contract.startDate ?? "");
    setEndDate(contract.endDate ?? ""); setCancelledDate(contract.cancelledDate ?? "");
    setLinks(contract.links ?? []); setNotes(contract.notes ?? "");
  }, [contract?.id]);

  if (!contract) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <p className="text-smoky6 text-[15px]">Loading...</p>
      </div>
    );
  }

  const canChangeStatus = contract.type === "pending" || contract.type === "active" || contract.type === "cancelled";
  const statusOptions =
    contract.type === "pending"   ? PENDING_STATUSES :
    contract.type === "active"    ? ACTIVE_STATUSES :
    contract.type === "cancelled" ? CANCELLED_STATUSES : [];

  function handleTypeSelect(value: string) {
    const t = value as ContractType;
    if (t === "pending")        setPendingTypeConfirm({ type: t, opts: {} });
    else if (t === "active")    setShowActiveTransition(true);
    else if (t === "completed") setShowCompletedPopup(true);
    else if (t === "cancelled") setPendingCancelledDate(true);
  }

  async function commitStatus() {
    if (!pendingStatusConfirm) return;
    const label = CONTRACT_STATUS_LABEL[pendingStatusConfirm] ?? pendingStatusConfirm;
    try {
      await apiFetch(`/api/contracts/${id}/status`, { method: "PATCH", json: { status: pendingStatusConfirm } });
      mutate();
      showSnack("success", `Status: ${label}`);
    } catch {
      showSnack("error", "Failed to update status");
    } finally {
      setPendingStatusConfirm(null);
    }
  }

  async function commitType() {
    if (!pendingTypeConfirm) return;
    const label = CONTRACT_TYPES.find((t) => t.value === pendingTypeConfirm.type)?.label ?? pendingTypeConfirm.type;
    try {
      await apiFetch(`/api/contracts/${id}/type`, { method: "PATCH", json: { type: pendingTypeConfirm.type, ...pendingTypeConfirm.opts } });
      mutate();
      showSnack("success", `Moved to ${label}`);
    } catch {
      showSnack("error", "Failed to move contract");
    } finally {
      setPendingTypeConfirm(null);
    }
  }

  async function commitSave() {
    try {
      await apiFetch(`/api/contracts/${id}`, {
        method: "PATCH",
        json: {
          client, title, description, workingHours, rating, positiveReviews, negativeReviews,
          currency, contractValue: valueInDiscussion ? "" : contractValue, valueInDiscussion,
          durationValue: durationInDiscussion ? "" : durationValue, durationUnit, durationInDiscussion,
          proposedOn: proposedOn || null, startDate: startDate || null,
          endDate: endDate || null, cancelledDate: cancelledDate || null,
          links, notes,
        },
      });
      mutate();
      showSnack("success", "Changes saved");
    } catch {
      showSnack("error", "Failed to save");
    } finally {
      setShowSaveConfirm(false);
    }
  }

  async function commitDelete() {
    try {
      await apiFetch(`/api/contracts/${id}`, { method: "DELETE" });
      showSnack("success", "Contract deleted");
      setTimeout(() => router.back(), 800);
    } catch {
      showSnack("error", "Failed to delete");
      setShowDeleteConfirm(false);
    }
  }

  const liveCompletionStatus = contract.type === "completed" ? contract.completionStatus : null;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-smoky6 hover:text-smoky13 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="font-bold text-smoky13 text-[22px]">{client || contract.client}<span className="text-blue500">.</span></span>
          {liveCompletionStatus && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border ${COMPLETION_CONFIG[liveCompletionStatus].cls}`}>
              {COMPLETION_CONFIG[liveCompletionStatus].label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canChangeStatus && (
            <CustomSelect value={null} placeholder="Set Status"
              options={statusOptions.filter((s) => s.value !== contract.status)}
              onChange={(v) => setPendingStatusConfirm(v as ContractStatus)}
              header="Set Status" variant="button" />
          )}
          <CustomSelect value={contract.type}
            options={CONTRACT_TYPES.filter((t) => t.value !== contract.type)}
            onChange={handleTypeSelect} header="Set Type" variant="button" />
          <button onClick={() => setShowSaveConfirm(true)}
            className="px-4 py-2 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <TabBar tab={tab} onChange={setTab} descriptionLabel="Contract Details" />

      {/* Content */}
      <div className="p-8">
        <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] overflow-hidden">

          {tab === "description" && (
            <div className="p-8">
              <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                <div>
                  <label className={labelCls}>Client Name</label>
                  <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Project / Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Redesign" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contract scope and details..." rows={4}
                    className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
                </div>
                <div>
                  <label className={labelCls}>Working Hours</label>
                  <input type="text" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="e.g. 20 hrs/week" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Rating</label>
                  <CustomSelect value={rating != null ? String(rating) : null} placeholder="No rating"
                    options={RATING_OPTIONS} onChange={(v) => setRating(Number(v))} variant="input" />
                </div>
                <div>
                  <label className={labelCls}>Positive Reviews</label>
                  <textarea value={positiveReviews} onChange={(e) => setPositiveReviews(e.target.value)} placeholder="What went well..." rows={3}
                    className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
                </div>
                <div>
                  <label className={labelCls}>Negative Reviews</label>
                  <textarea value={negativeReviews} onChange={(e) => setNegativeReviews(e.target.value)} placeholder="What could be better..." rows={3}
                    className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-smoky8 text-[13px] font-medium">Contract Value</label>
                    <Toggle checked={valueInDiscussion} onChange={setValueInDiscussion} label="In discussion" />
                  </div>
                  {!valueInDiscussion
                    ? <CurrencyInput currency={currency} onCurrencyChange={setCurrency} value={contractValue} onValueChange={setContractValue} valuePlaceholder="e.g. 5,000" />
                    : <div className="rounded-[12px] outline outline-1 outline-smoky4 px-4 py-3 text-[14px] text-smoky6 bg-smoky3">Value in discussion</div>
                  }
                </div>

                <div>
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

                <div className="col-span-2">
                  <p className="text-smoky8 text-[13px] font-semibold mb-4 uppercase tracking-wide">Timeline</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Proposed On</label><DatePicker value={proposedOn} onChange={setProposedOn} placeholder="Pick a date" /></div>
                    {(contract.type === "active" || contract.type === "completed") && (
                      <div><label className={labelCls}>Start Date</label><DatePicker value={startDate} onChange={setStartDate} placeholder="Pick a date" /></div>
                    )}
                    {contract.type === "completed" && (
                      <div><label className={labelCls}>End Date</label><DatePicker value={endDate} onChange={setEndDate} placeholder="Pick a date" /></div>
                    )}
                    {contract.type === "cancelled" && (
                      <div><label className={labelCls}>Cancelled Date</label><DatePicker value={cancelledDate} onChange={setCancelledDate} placeholder="Pick a date" /></div>
                    )}
                  </div>
                </div>
              </div>
              <DeleteButton onClick={() => setShowDeleteConfirm(true)} label="Delete this contract" />
            </div>
          )}

          {tab === "files" && <LinksTab links={links} onChange={setLinks} resourceLabel="contract" />}
          {tab === "notes" && <NotesTab notes={notes} onChange={setNotes} />}
        </div>
      </div>

      {/* Modals */}
      {showActiveTransition && (
        <ActiveTransitionPopup contract={contract}
          onConfirm={async (opts) => {
            await apiFetch(`/api/contracts/${id}/type`, { method: "PATCH", json: { type: "active", ...opts } });
            setShowActiveTransition(false);
            mutate();
            showSnack("success", "Moved to Active");
          }}
          onClose={() => setShowActiveTransition(false)} />
      )}
      {showCompletedPopup && (
        <ContractCompletedPopup contract={contract}
          onConfirm={async (opts) => {
            await apiFetch(`/api/contracts/${id}/type`, { method: "PATCH", json: { type: "completed", ...opts } });
            setShowCompletedPopup(false);
            mutate();
            showSnack("success", "Moved to Completed");
          }}
          onClose={() => setShowCompletedPopup(false)} />
      )}
      {pendingCancelledDate && (
        <DatePopup title="Cancelled Date" label="When was this contract cancelled?"
          onConfirm={async (date) => {
            await apiFetch(`/api/contracts/${id}/type`, { method: "PATCH", json: { type: "cancelled", date } });
            setPendingCancelledDate(false);
            mutate();
            showSnack("success", "Moved to Cancelled");
          }}
          onClose={() => setPendingCancelledDate(false)} />
      )}
      {pendingTypeConfirm && (
        <ConfirmModal title="Move Contract"
          message={`Move this contract to ${CONTRACT_TYPES.find((t) => t.value === pendingTypeConfirm.type)?.label}?`}
          confirmLabel="Move" onConfirm={commitType} onClose={() => setPendingTypeConfirm(null)} />
      )}
      {pendingStatusConfirm && (
        <ConfirmModal title="Change Status"
          message={`Set status to "${CONTRACT_STATUS_LABEL[pendingStatusConfirm]}"?`}
          confirmLabel="Change" onConfirm={commitStatus} onClose={() => setPendingStatusConfirm(null)} />
      )}
      {showSaveConfirm && (
        <ConfirmModal title="Save Changes" message="Save all changes to this contract?" confirmLabel="Save"
          onConfirm={commitSave} onClose={() => setShowSaveConfirm(false)} />
      )}
      {showDeleteConfirm && (
        <ConfirmModal title="Delete Contract"
          message={`Delete ${contract.client} — ${contract.title}? This cannot be undone.`}
          confirmLabel="Delete" danger onConfirm={commitDelete} onClose={() => setShowDeleteConfirm(false)} />
      )}
      {snackbar && <Snackbar variant={snackbar.variant} message={snackbar.message} onDone={() => setSnackbar(null)} />}
    </div>
  );
}
