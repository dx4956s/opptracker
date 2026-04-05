"use client";

import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";
import CurrencyInput from "@/components/ui/CurrencyInput";
import CustomSelect from "@/components/ui/CustomSelect";
import { smallInputCls } from "@/lib/styles";
import { DurationUnit, TypeTransitionOptions, DURATION_UNITS, formatDuration } from "@/store/contractStore";

interface Props {
  contract: {
    currency: string;
    contractValue: string;
    valueInDiscussion: boolean;
    durationValue: string;
    durationUnit: DurationUnit;
    durationInDiscussion: boolean;
  };
  onConfirm: (opts: TypeTransitionOptions) => void;
  onClose: () => void;
}

export default function ActiveTransitionPopup({ contract, onConfirm, onClose }: Props) {
  const [startDate, setStartDate] = useState("");
  const [valueChoice, setValueChoice] = useState<"same" | "changed">("same");
  const [newCurrency, setNewCurrency] = useState(contract.currency);
  const [newValue, setNewValue] = useState(contract.contractValue);
  const [durationChoice, setDurationChoice] = useState<"same" | "changed">("same");
  const [newDurValue, setNewDurValue] = useState(contract.durationValue);
  const [newDurUnit, setNewDurUnit] = useState<DurationUnit>(contract.durationUnit);

  const currentValueLabel = contract.valueInDiscussion
    ? "In discussion"
    : contract.contractValue
    ? `${contract.currency} ${contract.contractValue}`.trim()
    : "Not set";
  const currentDurLabel = formatDuration(contract.durationValue, contract.durationUnit, contract.durationInDiscussion);

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) return;
    const opts: TypeTransitionOptions = { date: startDate };
    if (valueChoice === "changed") { opts.contractValue = newValue; opts.currency = newCurrency; opts.valueInDiscussion = false; }
    if (durationChoice === "changed") { opts.durationValue = newDurValue; opts.durationUnit = newDurUnit; opts.durationInDiscussion = false; }
    onConfirm(opts);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[460px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Move to Active</h3>
        <p className="text-smoky7 text-[14px] mb-6">Confirm or update contract terms before starting.</p>
        <form onSubmit={handleConfirm} noValidate className="flex flex-col gap-5">
          <div>
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Start Date</label>
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Pick a date" />
          </div>
          <div className="border border-smoky4 rounded-[14px] p-4">
            <p className="text-smoky8 text-[12px] font-semibold uppercase tracking-wide mb-3">Contract Value</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked={valueChoice === "same"} onChange={() => setValueChoice("same")} className="accent-blue500 w-4 h-4 shrink-0" />
                <span className="text-smoky9 text-[13px]">Same as agreed — <span className="font-medium text-smoky13">{currentValueLabel}</span></span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" checked={valueChoice === "changed"} onChange={() => setValueChoice("changed")} className="accent-blue500 w-4 h-4 shrink-0 mt-2.5" />
                <div className="flex-1">
                  <span className="text-smoky9 text-[13px]">Changed</span>
                  {valueChoice === "changed" && (
                    <CurrencyInput size="sm" currency={newCurrency} onCurrencyChange={setNewCurrency}
                      value={newValue} onValueChange={setNewValue} valuePlaceholder="e.g. 5,000" className="mt-2" />
                  )}
                </div>
              </label>
            </div>
          </div>
          <div className="border border-smoky4 rounded-[14px] p-4">
            <p className="text-smoky8 text-[12px] font-semibold uppercase tracking-wide mb-3">Duration</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" checked={durationChoice === "same"} onChange={() => setDurationChoice("same")} className="accent-blue500 w-4 h-4 shrink-0" />
                <span className="text-smoky9 text-[13px]">Same as agreed — <span className="font-medium text-smoky13">{currentDurLabel}</span></span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" checked={durationChoice === "changed"} onChange={() => setDurationChoice("changed")} className="accent-blue500 w-4 h-4 shrink-0 mt-2.5" />
                <div className="flex-1">
                  <span className="text-smoky9 text-[13px]">Changed</span>
                  {durationChoice === "changed" && (
                    <div className="flex gap-2 mt-2">
                      <input type="text" value={newDurValue} onChange={(e) => setNewDurValue(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 3"
                        className={`${smallInputCls} w-[80px]`} />
                      <div className="flex-1">
                        <CustomSelect options={DURATION_UNITS} value={newDurUnit} onChange={(v) => setNewDurUnit(v as DurationUnit)} variant="input" />
                      </div>
                    </div>
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
