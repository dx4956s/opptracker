"use client";

import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import { FreelanceTypeTransitionOptions, calcDuration, calcTotalEarnings } from "@/store/freelanceStore";

interface Props {
  freelance: { startDate: string | null; currency: string; hourlyRate: string; hoursPerDay: string };
  onConfirm: (opts: FreelanceTypeTransitionOptions) => void;
  onClose: () => void;
}

export default function FreelanceCompletedPopup({ freelance, onConfirm, onClose }: Props) {
  const [endDate, setEndDate] = useState("");
  const duration = endDate ? calcDuration(freelance.startDate, endDate) : null;
  const earnings = endDate ? calcTotalEarnings(freelance.hourlyRate, freelance.hoursPerDay, freelance.startDate, endDate) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[400px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Project Completed</h3>
        <p className="text-smoky7 text-[14px] mb-6">Set the delivery date to calculate your total earnings.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (endDate) onConfirm({ date: endDate, totalEarnings: earnings }); }} noValidate className="flex flex-col gap-5">
          <div>
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Delivery Date</label>
            <DatePicker value={endDate} onChange={setEndDate} placeholder="Pick a date" />
          </div>
          {endDate && duration !== null && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-smoky7">Duration</span>
                <span className="font-medium text-smoky13">{duration} day{duration !== 1 ? "s" : ""}</span>
              </div>
              {earnings !== null ? (
                <div className="flex items-center justify-between text-[13px] bg-smoky2 rounded-[10px] px-4 py-3">
                  <span className="text-smoky7">Total earnings</span>
                  <span className="font-semibold text-smoky13">{freelance.currency ? `${freelance.currency} ` : ""}{earnings}</span>
                </div>
              ) : (
                <p className="text-smoky6 text-[12px]">No rate set — earnings will not be calculated.</p>
              )}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
            <button type="submit" disabled={!endDate} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:opacity-40 text-white text-[14px] font-bold transition-colors">Mark Completed</button>
          </div>
        </form>
      </div>
    </div>
  );
}
