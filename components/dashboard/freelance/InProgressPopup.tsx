"use client";

import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import { smallInputCls } from "@/lib/styles";
import { FreelanceTypeTransitionOptions } from "@/store/freelanceStore";

interface Props {
  freelance: { currency: string; hourlyRate: string; hoursPerDay: string };
  onConfirm: (opts: FreelanceTypeTransitionOptions) => void;
  onClose: () => void;
}

export default function InProgressPopup({ freelance, onConfirm, onClose }: Props) {
  const [startDate, setStartDate] = useState("");
  const [rateChoice, setRateChoice] = useState<"same" | "changed">("same");
  const [newCurrency, setNewCurrency] = useState(freelance.currency);
  const [newHourlyRate, setNewHourlyRate] = useState(freelance.hourlyRate);
  const [newHoursPerDay, setNewHoursPerDay] = useState(freelance.hoursPerDay);

  const currentRateLabel = freelance.hourlyRate
    ? `${freelance.currency || ""} ${freelance.hourlyRate}/hr · ${freelance.hoursPerDay || "?"} hrs/day`.trim()
    : "Not set";

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) return;
    const opts: FreelanceTypeTransitionOptions = { date: startDate };
    if (rateChoice === "changed") { opts.currency = newCurrency; opts.hourlyRate = newHourlyRate; opts.hoursPerDay = newHoursPerDay; }
    onConfirm(opts);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[440px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Bid Accepted</h3>
        <p className="text-smoky7 text-[14px] mb-6">Set the project start date and confirm your rate.</p>
        <form onSubmit={handleConfirm} noValidate className="flex flex-col gap-5">
          <div>
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Start Date</label>
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Pick a date" />
          </div>
          <div className="border border-smoky4 rounded-[14px] p-4">
            <p className="text-smoky8 text-[12px] font-semibold uppercase tracking-wide mb-3">Hourly Rate & Hours/Day</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked={rateChoice === "same"} onChange={() => setRateChoice("same")} className="accent-blue500 w-4 h-4 shrink-0" />
                <span className="text-smoky9 text-[13px]">Same as bid — <span className="font-medium text-smoky13">{currentRateLabel}</span></span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" checked={rateChoice === "changed"} onChange={() => setRateChoice("changed")} className="accent-blue500 w-4 h-4 shrink-0 mt-2.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-smoky9 text-[13px]">Changed after negotiation</span>
                  {rateChoice === "changed" && (
                    <div className="flex gap-2 mt-2">
                      <input type="text" value={newCurrency} onChange={(e) => setNewCurrency(e.target.value.toUpperCase().slice(0, 5))} placeholder="USD"
                        className={`${smallInputCls} w-[70px]`} />
                      <input type="text" value={newHourlyRate} onChange={(e) => setNewHourlyRate(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Rate/hr"
                        className={`${smallInputCls} flex-1`} />
                      <input type="text" value={newHoursPerDay} onChange={(e) => setNewHoursPerDay(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Hrs/day"
                        className={`${smallInputCls} w-[90px]`} />
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
            <button type="submit" disabled={!startDate} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:opacity-40 text-white text-[14px] font-bold transition-colors">Start Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}
