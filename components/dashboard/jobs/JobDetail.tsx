"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import DatePicker from "@/components/ui/DatePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DatePopup from "@/components/ui/DatePopup";
import WorkingTransitionPopup from "@/components/dashboard/jobs/WorkingTransitionPopup";
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
  JobType, JobStatus,
  APPLIED_STATUSES, WORKING_STATUSES, REJECTED_STATUSES,
  JOB_TYPES, Job, JOB_STATUS_LABEL,
} from "@/store/jobStore";

interface Props { id: string }

export default function JobDetail({ id }: Props) {
  const router = useRouter();

  const { data, mutate } = useSWR<{ data: Job }>(`/api/jobs/${id}`, authedFetcher);
  const job = data?.data;

  const [tab, setTab] = useState<"description" | "files" | "notes">("description");

  const [company, setCompany]                       = useState("");
  const [role, setRole]                             = useState("");
  const [description, setDescription]               = useState("");
  const [workingHours, setWorkingHours]             = useState("");
  const [rating, setRating]                         = useState<number | null>(null);
  const [positiveReviews, setPositiveReviews]       = useState("");
  const [negativeReviews, setNegativeReviews]       = useState("");
  const [currency, setCurrency]                     = useState("");
  const [expectedPackage, setExpectedPackage]       = useState("");
  const [salaryInDiscussion, setSalaryInDiscussion] = useState(false);
  const [appliedOn, setAppliedOn]                   = useState("");
  const [startDate, setStartDate]                   = useState("");
  const [endDate, setEndDate]                       = useState("");
  const [rejectedDate, setRejectedDate]             = useState("");
  const [links, setLinks]                           = useState<LinkItem[]>([]);
  const [notes, setNotes]                           = useState("");

  const [pendingDate, setPendingDate]               = useState<JobType | null>(null);
  const [showWorkingTransition, setShowWorkingTransition] = useState(false);
  const [pendingTypeConfirm, setPendingTypeConfirm] = useState<{ type: JobType; date?: string } | null>(null);
  const [pendingStatusConfirm, setPendingStatusConfirm] = useState<JobStatus | null>(null);
  const [showSaveConfirm, setShowSaveConfirm]       = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm]   = useState(false);
  const [snackbar, setSnackbar]                     = useState<{ variant: "success" | "error"; message: string } | null>(null);
  function showSnack(v: "success" | "error", msg: string) { setSnackbar({ variant: v, message: msg }); }

  useEffect(() => {
    if (!job) return;
    setCompany(job.company);
    setRole(job.role);
    setDescription(job.description);
    setWorkingHours(job.workingHours);
    setRating(job.rating);
    setPositiveReviews(job.positiveReviews);
    setNegativeReviews(job.negativeReviews);
    setCurrency(job.currency);
    setExpectedPackage(job.expectedPackage);
    setSalaryInDiscussion(job.salaryInDiscussion);
    setAppliedOn(job.appliedOn ?? "");
    setStartDate(job.startDate ?? "");
    setEndDate(job.endDate ?? "");
    setRejectedDate(job.rejectedDate ?? "");
    setLinks(job.links ?? []);
    setNotes(job.notes ?? "");
  }, [job?.id]);

  if (!job) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <p className="text-smoky6 text-[15px]">Loading...</p>
      </div>
    );
  }

  const canChangeStatus = job.type === "applied" || job.type === "working" || job.type === "rejected";
  const statusOptions =
    job.type === "applied"  ? APPLIED_STATUSES :
    job.type === "working"  ? WORKING_STATUSES :
    job.type === "rejected" ? REJECTED_STATUSES : [];

  function handleTypeSelect(value: string) {
    const t = value as JobType;
    if (t === "applied")  setPendingTypeConfirm({ type: t });
    else if (t === "working") setShowWorkingTransition(true);
    else setPendingDate(t);
  }

  async function handleDateConfirm(date: string) {
    if (!pendingDate) return;
    const type = pendingDate;
    const label = JOB_TYPES.find((t) => t.value === type)?.label ?? type;
    setPendingDate(null);
    try {
      await apiFetch(`/api/jobs/${id}/type`, { method: "PATCH", json: { type, date } });
      mutate();
      showSnack("success", `Moved to ${label}`);
    } catch {
      showSnack("error", "Failed to move job");
    }
  }

  async function commitType() {
    if (!pendingTypeConfirm) return;
    const label = JOB_TYPES.find((t) => t.value === pendingTypeConfirm.type)?.label ?? pendingTypeConfirm.type;
    try {
      await apiFetch(`/api/jobs/${id}/type`, {
        method: "PATCH",
        json: { type: pendingTypeConfirm.type, ...(pendingTypeConfirm.date ? { date: pendingTypeConfirm.date } : {}) },
      });
      mutate();
      showSnack("success", `Moved to ${label}`);
    } catch {
      showSnack("error", "Failed to move job");
    } finally {
      setPendingTypeConfirm(null);
    }
  }

  async function commitStatus() {
    if (!pendingStatusConfirm) return;
    const label = JOB_STATUS_LABEL[pendingStatusConfirm] ?? pendingStatusConfirm;
    try {
      await apiFetch(`/api/jobs/${id}/status`, { method: "PATCH", json: { status: pendingStatusConfirm } });
      mutate();
      showSnack("success", `Status: ${label}`);
    } catch {
      showSnack("error", "Failed to update status");
    } finally {
      setPendingStatusConfirm(null);
    }
  }

  async function commitSave() {
    try {
      await apiFetch(`/api/jobs/${id}`, {
        method: "PATCH",
        json: {
          company, role, description, workingHours, rating, positiveReviews, negativeReviews,
          currency, expectedPackage: salaryInDiscussion ? "" : expectedPackage, salaryInDiscussion,
          appliedOn: appliedOn || null, startDate: startDate || null,
          endDate: endDate || null, rejectedDate: rejectedDate || null,
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
      await apiFetch(`/api/jobs/${id}`, { method: "DELETE" });
      showSnack("success", "Job deleted");
      setTimeout(() => router.back(), 800);
    } catch {
      showSnack("error", "Failed to delete");
      setShowDeleteConfirm(false);
    }
  }

  const datePopupProps = pendingDate === "left"
    ? { title: "End Date",      label: "When did you leave?" }
    : { title: "Rejected Date", label: "When were you rejected?" };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-smoky6 hover:text-smoky13 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="font-bold text-smoky13 text-[22px]">
            {company || job.company}<span className="text-blue500">.</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canChangeStatus && (
            <CustomSelect value={null} placeholder="Set Status"
              options={statusOptions.filter((s) => s.value !== job.status)}
              onChange={(v) => setPendingStatusConfirm(v as JobStatus)}
              header="Set Status" variant="button" />
          )}
          <CustomSelect value={job.type}
            options={JOB_TYPES.filter((t) => t.value !== job.type)}
            onChange={handleTypeSelect} header="Set Type" variant="button" />
          <button onClick={() => setShowSaveConfirm(true)}
            className="px-4 py-2 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <TabBar tab={tab} onChange={setTab} descriptionLabel="Job Description" />

      {/* Content */}
      <div className="p-8">
        <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] overflow-hidden">

          {tab === "description" && (
            <div className="p-8">
              <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                <div>
                  <label className={labelCls}>Company Name</label>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Job Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Job description..." rows={4}
                    className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
                </div>
                <div>
                  <label className={labelCls}>Working Hours</label>
                  <input type="text" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="e.g. 9–6, flexible" className={inputCls} />
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
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-smoky8 text-[13px] font-medium">Expected Package</label>
                    <Toggle checked={salaryInDiscussion} onChange={setSalaryInDiscussion} label="In discussion" />
                  </div>
                  {!salaryInDiscussion
                    ? <CurrencyInput currency={currency} onCurrencyChange={setCurrency} value={expectedPackage} onValueChange={setExpectedPackage} valuePlaceholder="e.g. 120,000" />
                    : <div className="rounded-[12px] outline outline-1 outline-smoky4 px-4 py-3 text-[14px] text-smoky6 bg-smoky3">Salary in discussion</div>
                  }
                </div>
                <div className="col-span-2">
                  <p className="text-smoky8 text-[13px] font-semibold mb-4 uppercase tracking-wide">Timeline</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Applied On</label><DatePicker value={appliedOn} onChange={setAppliedOn} placeholder="Pick a date" /></div>
                    {(job.type === "working" || job.type === "left") && (
                      <div><label className={labelCls}>Start Date</label><DatePicker value={startDate} onChange={setStartDate} placeholder="Pick a date" /></div>
                    )}
                    {job.type === "left" && (
                      <div><label className={labelCls}>End Date</label><DatePicker value={endDate} onChange={setEndDate} placeholder="Pick a date" /></div>
                    )}
                    {job.type === "rejected" && (
                      <div><label className={labelCls}>Rejected Date</label><DatePicker value={rejectedDate} onChange={setRejectedDate} placeholder="Pick a date" /></div>
                    )}
                  </div>
                </div>
              </div>
              <DeleteButton onClick={() => setShowDeleteConfirm(true)} label="Delete this job" />
            </div>
          )}

          {tab === "files" && <LinksTab links={links} onChange={setLinks} resourceLabel="job" />}
          {tab === "notes" && <NotesTab notes={notes} onChange={setNotes} />}
        </div>
      </div>

      {/* Modals */}
      {pendingDate && (
        <DatePopup title={datePopupProps.title} label={datePopupProps.label} onConfirm={handleDateConfirm} onClose={() => setPendingDate(null)} />
      )}
      {showWorkingTransition && (
        <WorkingTransitionPopup
          job={{ currency: job.currency, expectedPackage: job.expectedPackage, salaryInDiscussion: job.salaryInDiscussion }}
          onConfirm={async (opts) => {
            await apiFetch(`/api/jobs/${id}/type`, { method: "PATCH", json: { type: "working", ...opts } });
            setShowWorkingTransition(false);
            mutate();
            showSnack("success", "Moved to Working");
          }}
          onClose={() => setShowWorkingTransition(false)} />
      )}
      {pendingTypeConfirm && (
        <ConfirmModal title="Move Job"
          message={`Move this job to ${JOB_TYPES.find((t) => t.value === pendingTypeConfirm.type)?.label}?`}
          confirmLabel="Move" onConfirm={commitType} onClose={() => setPendingTypeConfirm(null)} />
      )}
      {pendingStatusConfirm && (
        <ConfirmModal title="Change Status"
          message={`Set status to "${JOB_STATUS_LABEL[pendingStatusConfirm]}"?`}
          confirmLabel="Change" onConfirm={commitStatus} onClose={() => setPendingStatusConfirm(null)} />
      )}
      {showSaveConfirm && (
        <ConfirmModal title="Save Changes" message="Save all changes to this job?" confirmLabel="Save"
          onConfirm={commitSave} onClose={() => setShowSaveConfirm(false)} />
      )}
      {showDeleteConfirm && (
        <ConfirmModal title="Delete Job"
          message={`Delete ${job.company} — ${job.role}? This cannot be undone.`}
          confirmLabel="Delete" danger onConfirm={commitDelete} onClose={() => setShowDeleteConfirm(false)} />
      )}
      {snackbar && <Snackbar variant={snackbar.variant} message={snackbar.message} onDone={() => setSnackbar(null)} />}
    </div>
  );
}
