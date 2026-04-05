"use client";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[380px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">{title}</h3>
        <p className="text-smoky7 text-[14px] mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 h-[48px] rounded-[12px] text-white text-[14px] font-bold transition-colors ${danger ? "bg-error hover:bg-error/80" : "bg-blue500 hover:bg-blue600"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
