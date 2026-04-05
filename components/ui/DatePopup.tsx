"use client";

import { useState } from "react";
import DatePicker from "@/components/ui/DatePicker";

interface Props {
  title: string;
  label: string;
  confirmLabel?: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
}

export default function DatePopup({ title, label, confirmLabel = "Next", onConfirm, onClose }: Props) {
  const [date, setDate] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[380px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">{title}</h3>
        <p className="text-smoky7 text-[14px] mb-6">{label}</p>
        <form onSubmit={(e) => { e.preventDefault(); if (date) onConfirm(date); }} noValidate>
          <div className="mb-6"><DatePicker value={date} onChange={setDate} placeholder="Pick a date" /></div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
            <button type="submit" disabled={!date} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:opacity-40 text-white text-[14px] font-bold transition-colors">{confirmLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
