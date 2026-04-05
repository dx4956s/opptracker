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
import NotesTab from "@/components/dashboard/shared/NotesTab";
import LinksTab, { LinkItem } from "@/components/dashboard/shared/LinksTab";
import { inputCls, labelCls } from "@/lib/styles";
import { RATING_OPTIONS } from "@/lib/constants";
import CurrencyInput from "@/components/ui/CurrencyInput";
import DeleteButton from "@/components/ui/DeleteButton";
import TabBar from "@/components/ui/TabBar";
import Snackbar from "@/components/ui/Snackbar";
import { authedFetcher, apiFetch } from "@/lib/fetcher";
import {
  FreelanceType, FreelanceStatus, FreelanceTypeTransitionOptions,
  BIDDING_STATUSES, IN_PROGRESS_STATUSES, LOST_STATUSES,
  FREELANCE_TYPES, TYPE_BADGE_CLS, Freelance,
  calcDuration, FREELANCE_STATUS_LABEL, FREELANCE_STATUS_BADGE_CLS,
} from "@/store/freelanceStore";

interface Props { id: string }

export default function FreelanceDetail({ id }: Props) {
  const router = useRouter();

  const { data, mutate } = useSWR<{ data: Freelance }>(`/api/freelance/${id}`, authedFetcher);
  const freelance = data?.data;

  const [tab, setTab] = useState<"description" | "files" | "notes">("description");

  const [client, setClient]                     = useState("");
  const [title, setTitle]                       = useState("");
  const [description, setDescription]           = useState("");
  const [rating, setRating]                     = useState<number | null>(null);
  const [positiveReviews, setPositiveReviews]   = useState("");
  const [negativeReviews, setNegativeReviews]   = useState("");
  const [currency, setCurrency]                 = useState("");
  const [hourlyRate, setHourlyRate]             = useState("");
  const [hoursPerDay, setHoursPerDay]           = useState("");
  const [bidDate, setBidDate]                   = useState("");
  const [startDate, setStartDate]               = useState("");
  const [endDate, setEndDate]                   = useState("");
  const [lostDate, setLostDate]                 = useState("");
  const [links, setLinks]                       = useState<LinkItem[]>([]);
  const [notes, setNotes]                       = useState("");

  const [showInProgressPopup, setShowInProgressPopup] = useState(false);
  const [showCompletedPopup, setShowCompletedPopup]   = useState(false);
  const [pendingLostDate, setPendingLostDate]         = useState(false);
  const [pendingTypeConfirm, setPendingTypeConfirm]   = useState<{ type: FreelanceType; opts: FreelanceTypeTransitionOptions } | null>(null);
  const [pendingStatusConfirm, setPendingStatusConfirm] = useState<FreelanceStatus | null>(null);
  const [showSaveConfirm, setShowSaveConfirm]         = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm]     = useState(false);
  const [snackbar, setSnackbar]                       = useState<{ variant: "success" | "error"; message: string } | null>(null);
  function showSnack(v: "success" | "error", msg: string) { setSnackbar({ variant: v, message: msg }); }

  useEffect(() => {
    if (!freelance) return;
    setClient(freelance.client); setTitle(freelance.title); setDescription(freelance.description);
    setRating(freelance.rating);
    setPositiveReviews(freelance.positiveReviews); setNegativeReviews(freelance.negativeReviews);
    setCurrency(freelance.currency); setHourlyRate(freelance.hourlyRate); setHoursPerDay(freelance.hoursPerDay);
    setBidDate(freelance.bidDate ?? ""); setStartDate(freelance.startDate ?? "");
    setEndDate(freelance.endDate ?? ""); setLostDate(freelance.lostDate ?? "");
    setLinks(freelance.links ?? []); setNotes(freelance.notes ?? "");
  }, [freelance?.id]);

  if (!freelance) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <p className="text-smoky6 text-[15px]">Loading...</p>
      </div>
    );
  }

  const statusOptions =
    freelance.type === "bidding"     ? BIDDING_STATUSES :
    freelance.type === "in_progress" ? IN_PROGRESS_STATUSES :
    freelance.type === "lost"        ? LOST_STATUSES : [];
  const canChangeStatus = statusOptions.length > 0;

  function handleTypeSelect(value: string) {
    const t = value as FreelanceType;
    if (t === "bidding")          setPendingTypeConfirm({ type: t, opts: {} });
    else if (t === "in_progress") setShowInProgressPopup(true);
    else if (t === "completed")   setShowCompletedPopup(true);
    else if (t === "lost")        setPendingLostDate(true);
  }

  async function commitStatus() {
    if (!pendingStatusConfirm) return;
    const label = FREELANCE_STATUS_LABEL[pendingStatusConfirm] ?? pendingStatusConfirm;
    try {
      await apiFetch(`/api/freelance/${id}/status`, { method: "PATCH", json: { status: pendingStatusConfirm } });
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
    const label = FREELANCE_TYPES.find((t) => t.value === pendingTypeConfirm.type)?.label ?? pendingTypeConfirm.type;
    try {
      await apiFetch(`/api/freelance/${id}/type`, { method: "PATCH", json: { type: pendingTypeConfirm.type, ...pendingTypeConfirm.opts } });
      mutate();
      showSnack("success", `Moved to ${label}`);
    } catch {
      showSnack("error", "Failed to move project");
    } finally {
      setPendingTypeConfirm(null);
    }
  }

  async function commitSave() {
    try {
      await apiFetch(`/api/freelance/${id}`, {
        method: "PATCH",
        json: {
          client, title, description, rating, positiveReviews, negativeReviews,
          currency, hourlyRate, hoursPerDay,
          bidDate: bidDate || null, startDate: startDate || null,
          endDate: endDate || null, lostDate: lostDate || null,
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
      await apiFetch(`/api/freelance/${id}`, { method: "DELETE" });
      showSnack("success", "Project deleted");
      setTimeout(() => router.back(), 800);
    } catch {
      showSnack("error", "Failed to delete");
      setShowDeleteConfirm(false);
    }
  }

  const duration = calcDuration(freelance.startDate, freelance.endDate);
  const typeLabel = FREELANCE_TYPES.find((t) => t.value === freelance.type)?.label ?? freelance.type;
  const statusLabel = freelance.status ? (FREELANCE_STATUS_LABEL[freelance.status] ?? freelance.status) : null;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-smoky6 hover:text-smoky13 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="font-bold text-smoky13 text-[22px]">{client || freelance.client}<span className="text-blue500">.</span></span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border ${TYPE_BADGE_CLS[freelance.type]}`}>
            {typeLabel}
          </span>
          {statusLabel && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border ${FREELANCE_STATUS_BADGE_CLS[freelance.status!] ?? "bg-smoky4 text-smoky7 border-smoky5"}`}>
              {statusLabel}
            </span>
          )}
          {freelance.type === "completed" && freelance.totalEarnings && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-success/10 text-success border border-success/20">
              {freelance.currency ? `${freelance.currency} ` : ""}{freelance.totalEarnings} earned
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canChangeStatus && (
            <CustomSelect value={null} placeholder="Set Status"
              options={statusOptions.filter((s) => s.value !== freelance.status)}
              onChange={(v) => setPendingStatusConfirm(v as FreelanceStatus)}
              header="Set Status" variant="button" />
          )}
          <CustomSelect value={freelance.type}
            options={FREELANCE_TYPES.filter((t) => t.value !== freelance.type)}
            onChange={handleTypeSelect} header="Set Type" variant="button" />
          <button onClick={() => setShowSaveConfirm(true)}
            className="px-4 py-2 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <TabBar tab={tab} onChange={setTab} descriptionLabel="Project Details" />

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
                  <label className={labelCls}>Project Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Website Redesign" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project scope and details..." rows={4}
                    className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
                </div>
                <div>
                  <label className={labelCls}>Rating</label>
                  <CustomSelect value={rating != null ? String(rating) : null} placeholder="No rating"
                    options={RATING_OPTIONS} onChange={(v) => setRating(Number(v))} variant="input" />
                </div>
                <div />
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
                  <label className={labelCls}>Hourly Rate</label>
                  <CurrencyInput currency={currency} onCurrencyChange={setCurrency}
                    value={hourlyRate} onValueChange={(v) => setHourlyRate(v.replace(/[^0-9.]/g, ""))}
                    valuePlaceholder="e.g. 85" suffix="/hr" />
                </div>
                <div>
                  <label className={labelCls}>Hours per Day</label>
                  <input type="text" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 6" className={inputCls} />
                </div>

                {freelance.type === "completed" && (
                  <div className="col-span-2">
                    <div className="flex gap-4">
                      {duration !== null && (
                        <div className="flex-1 flex items-center justify-between text-[13px] bg-smoky2 rounded-[12px] px-4 py-3">
                          <span className="text-smoky7">Duration</span>
                          <span className="font-semibold text-smoky13">{duration} day{duration !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                      {freelance.totalEarnings && (
                        <div className="flex-1 flex items-center justify-between text-[13px] bg-smoky2 rounded-[12px] px-4 py-3">
                          <span className="text-smoky7">Total earnings</span>
                          <span className="font-semibold text-smoky13">{freelance.currency ? `${freelance.currency} ` : ""}{freelance.totalEarnings}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <p className="text-smoky8 text-[13px] font-semibold mb-4 uppercase tracking-wide">Timeline</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Bid Date</label><DatePicker value={bidDate} onChange={setBidDate} placeholder="Pick a date" /></div>
                    {(freelance.type === "in_progress" || freelance.type === "completed") && (
                      <div><label className={labelCls}>Start Date</label><DatePicker value={startDate} onChange={setStartDate} placeholder="Pick a date" /></div>
                    )}
                    {freelance.type === "completed" && (
                      <div><label className={labelCls}>Delivery Date</label><DatePicker value={endDate} onChange={setEndDate} placeholder="Pick a date" /></div>
                    )}
                    {freelance.type === "lost" && (
                      <div><label className={labelCls}>Lost Date</label><DatePicker value={lostDate} onChange={setLostDate} placeholder="Pick a date" /></div>
                    )}
                  </div>
                </div>
              </div>
              <DeleteButton onClick={() => setShowDeleteConfirm(true)} label="Delete this project" />
            </div>
          )}

          {tab === "files" && <LinksTab links={links} onChange={setLinks} />}
          {tab === "notes" && <NotesTab notes={notes} onChange={setNotes} />}
        </div>
      </div>

      {/* Modals */}
      {showInProgressPopup && (
        <InProgressPopup freelance={freelance}
          onConfirm={async (opts) => {
            await apiFetch(`/api/freelance/${id}/type`, { method: "PATCH", json: { type: "in_progress", ...opts } });
            setShowInProgressPopup(false);
            mutate();
            showSnack("success", "Moved to In Progress");
          }}
          onClose={() => setShowInProgressPopup(false)} />
      )}
      {showCompletedPopup && (
        <FreelanceCompletedPopup freelance={freelance}
          onConfirm={async (opts) => {
            await apiFetch(`/api/freelance/${id}/type`, { method: "PATCH", json: { type: "completed", ...opts } });
            setShowCompletedPopup(false);
            mutate();
            showSnack("success", "Moved to Completed");
          }}
          onClose={() => setShowCompletedPopup(false)} />
      )}
      {pendingLostDate && (
        <DatePopup title="Bid Lost" label="When did you find out?" confirmLabel="Next"
          onConfirm={async (date) => {
            await apiFetch(`/api/freelance/${id}/type`, { method: "PATCH", json: { type: "lost", date } });
            setPendingLostDate(false);
            mutate();
            showSnack("success", "Moved to Lost");
          }}
          onClose={() => setPendingLostDate(false)} />
      )}
      {pendingTypeConfirm && (
        <ConfirmModal title="Move Project"
          message={`Move this project to ${FREELANCE_TYPES.find((t) => t.value === pendingTypeConfirm.type)?.label}?`}
          confirmLabel="Move" onConfirm={commitType} onClose={() => setPendingTypeConfirm(null)} />
      )}
      {pendingStatusConfirm && (
        <ConfirmModal title="Change Status"
          message={`Set status to "${FREELANCE_STATUS_LABEL[pendingStatusConfirm] ?? pendingStatusConfirm}"?`}
          confirmLabel="Change" onConfirm={commitStatus} onClose={() => setPendingStatusConfirm(null)} />
      )}
      {showSaveConfirm && (
        <ConfirmModal title="Save Changes" message="Save all changes to this project?" confirmLabel="Save"
          onConfirm={commitSave} onClose={() => setShowSaveConfirm(false)} />
      )}
      {showDeleteConfirm && (
        <ConfirmModal title="Delete Project"
          message={`Delete ${freelance.client} — ${freelance.title}? This cannot be undone.`}
          confirmLabel="Delete" danger onConfirm={commitDelete} onClose={() => setShowDeleteConfirm(false)} />
      )}
      {snackbar && <Snackbar variant={snackbar.variant} message={snackbar.message} onDone={() => setSnackbar(null)} />}
    </div>
  );
}
