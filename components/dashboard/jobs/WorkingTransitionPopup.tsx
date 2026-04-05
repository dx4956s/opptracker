"use client";

import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { JobTypeTransitionOptions } from "@/store/jobStore";

interface Props {
  job: { currency: string; expectedPackage: string; salaryInDiscussion: boolean };
  onConfirm: (opts: JobTypeTransitionOptions) => void;
  onClose: () => void;
}

export default function WorkingTransitionPopup({ job, onConfirm, onClose }: Props) {
  const [startDate, setStartDate] = useState("");
  const [salaryChoice, setSalaryChoice] = useState<"same" | "changed">("same");
  const [newCurrency, setNewCurrency] = useState(job.currency);
  const [newPackage, setNewPackage] = useState(job.expectedPackage);

  const currentSalaryLabel = job.salaryInDiscussion
    ? "In discussion"
    : job.expectedPackage
    ? `${job.currency} ${job.expectedPackage}/yr`.trim()
    : "Not set";

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) return;
    const opts: JobTypeTransitionOptions = { date: startDate };
    if (salaryChoice === "changed") {
      opts.expectedPackage = newPackage;
      opts.currency = newCurrency;
      opts.salaryInDiscussion = false;
    }
    onConfirm(opts);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[420px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Move to Working</h3>
        <p className="text-smoky7 text-[14px] mb-6">Confirm or update salary before starting.</p>
        <form onSubmit={handleConfirm} noValidate className="flex flex-col gap-5">
          <div>
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Start Date</label>
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Pick a date" />
          </div>
          <div className="border border-smoky4 rounded-[14px] p-4">
            <p className="text-smoky8 text-[12px] font-semibold uppercase tracking-wide mb-3">
              Salary <span className="text-smoky6 font-normal normal-case tracking-normal">/yr</span>
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked={salaryChoice === "same"} onChange={() => setSalaryChoice("same")} className="accent-blue500 w-4 h-4 shrink-0" />
                <span className="text-smoky9 text-[13px]">Same as discussed — <span className="font-medium text-smoky13">{currentSalaryLabel}</span></span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" checked={salaryChoice === "changed"} onChange={() => setSalaryChoice("changed")} className="accent-blue500 w-4 h-4 shrink-0 mt-2.5" />
                <div className="flex-1">
                  <span className="text-smoky9 text-[13px]">Changed</span>
                  {salaryChoice === "changed" && (
                    <CurrencyInput size="sm" currency={newCurrency} onCurrencyChange={setNewCurrency}
                      value={newPackage} onValueChange={setNewPackage} valuePlaceholder="e.g. 140,000" className="mt-2" />
                  )}
                </div>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
            <button type="submit" disabled={!startDate} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:opacity-40 text-white text-[14px] font-bold transition-colors">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
}
