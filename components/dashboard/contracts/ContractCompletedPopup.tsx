"use client";

import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import { CompletionStatus, TypeTransitionOptions, DurationUnit, durationToDays, calcCompletionStatus, formatDuration } from "@/store/contractStore";

export const COMPLETION_CONFIG: Record<CompletionStatus, { label: string; cls: string }> = {
  on_time:    { label: "On Time",    cls: "bg-success/10 text-success border-success/20" },
  over_time:  { label: "Over Time",  cls: "bg-error/10 text-error border-error/20" },
  under_time: { label: "Under Time", cls: "bg-blue50 text-blue700 border-blue100" },
};

export function CompletionBadge({ status }: { status: CompletionStatus | null }) {
  if (!status) return <span className="text-smoky6 text-[13px]">—</span>;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border ${COMPLETION_CONFIG[status].cls}`}>
      {COMPLETION_CONFIG[status].label}
    </span>
  );
}

interface Props {
  contract: {
    startDate: string | null;
    durationValue: string;
    durationUnit: DurationUnit;
    durationInDiscussion: boolean;
  };
  onConfirm: (opts: TypeTransitionOptions) => void;
  onClose: () => void;
}

export default function ContractCompletedPopup({ contract, onConfirm, onClose }: Props) {
  const [endDate, setEndDate] = useState("");

  const hasPlanned = !contract.durationInDiscussion && !!contract.durationValue && !!contract.startDate;
  const status = hasPlanned && endDate
    ? calcCompletionStatus(contract.startDate, endDate, contract.durationValue, contract.durationUnit)
    : null;
  const plannedDays = hasPlanned ? durationToDays(contract.durationValue, contract.durationUnit) : 0;
  const actualDays = (contract.startDate && endDate)
    ? Math.max(0, Math.floor((new Date(endDate + "T00:00:00").getTime() - new Date(contract.startDate + "T00:00:00").getTime()) / 86400000))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[400px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Mark as Completed</h3>
        <p className="text-smoky7 text-[14px] mb-6">Set the end date to calculate contract performance.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (endDate) onConfirm({ date: endDate, completionStatus: status }); }} noValidate className="flex flex-col gap-5">
          <div>
            <label className="block text-smoky8 text-[13px] font-medium mb-2">End Date</label>
            <DatePicker value={endDate} onChange={setEndDate} placeholder="Pick a date" />
          </div>
          {hasPlanned && endDate && actualDays !== null && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-smoky7">Planned duration</span>
                <span className="font-medium text-smoky13">{formatDuration(contract.durationValue, contract.durationUnit, false)} ({plannedDays} days)</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-smoky7">Actual duration</span>
                <span className="font-medium text-smoky13">{actualDays} day{actualDays !== 1 ? "s" : ""}</span>
              </div>
              {status && (
                <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border font-semibold text-[13px] ${COMPLETION_CONFIG[status].cls}`}>
                  {status === "on_time" && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                  {status === "over_time" && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4v3.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  )}
                  {status === "under_time" && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M2 7a5 5 0 1 0 10 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  )}
                  {COMPLETION_CONFIG[status].label}
                </div>
              )}
            </div>
          )}
          {!hasPlanned && (
            <p className="text-smoky6 text-[12px]">No planned duration set — completion status will not be tracked.</p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
            <button type="submit" disabled={!endDate} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:opacity-40 text-white text-[14px] font-bold transition-colors">Complete</button>
          </div>
        </form>
      </div>
    </div>
  );
}
