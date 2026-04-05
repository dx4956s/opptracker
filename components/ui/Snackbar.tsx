"use client";

import { useEffect } from "react";

interface Props {
  variant: "success" | "error";
  message: string;
  onDone: () => void;
}

export default function Snackbar({ variant, message, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  const ok = variant === "success";

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-[14px] text-[13px] font-medium whitespace-nowrap
      shadow-[0px_8px_28px_0px] ${ok ? "bg-smoky13 text-white shadow-smoky13/25" : "bg-white text-smoky13 shadow-smoky13/10 outline outline-1 outline-error/20"}`}>
      {ok ? (
        <svg className="text-success shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5 8l2.3 2.3L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg className="text-error shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
      {message}
    </div>
  );
}
