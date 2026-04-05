"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  options: SelectOption[];
  onChange: (value: string) => void;
  value?: string | null;
  placeholder?: string;
  header?: string;
  /**
   * "input"  — full-width, looks like a form field (default)
   * "button" — compact inline button, e.g. top-bar actions
   */
  variant?: "input" | "button";
  className?: string;
}

export default function CustomSelect({
  options,
  onChange,
  value,
  placeholder = "Select...",
  header,
  variant = "input",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const selectedLabel = value != null ? options.find((o) => o.value === value)?.label : null;

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const topVal = spaceBelow > 240 ? r.bottom + 4 : undefined;
      const bottomVal = spaceBelow <= 240 ? window.innerHeight - r.top + 4 : undefined;

      if (variant === "input") {
        setStyle({ top: topVal, bottom: bottomVal, left: r.left, width: r.width });
      } else {
        setStyle({ top: topVal, bottom: bottomVal, right: window.innerWidth - r.right });
      }
    }
  }, [open, variant]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        popRef.current && !popRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const triggerCls =
    variant === "input"
      ? `w-full rounded-[12px] outline outline-1 px-4 py-3 text-[14px] flex items-center justify-between transition-all
         ${open ? "outline-blue500" : "outline-smoky5 hover:outline-smoky7"} ${className}`
      : `flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[13px] font-medium border transition-colors
         ${open ? "border-blue500 text-blue500" : "border-smoky5 text-smoky8 hover:border-smoky6 hover:text-smoky13"} ${className}`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={triggerCls}
      >
        <span className={selectedLabel ? "text-smoky13" : "text-smoky6"}>
          {selectedLabel ?? placeholder}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""} ${variant === "input" ? "text-smoky6" : "text-smoky7"}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={popRef}
          style={style}
          className={`fixed z-50 bg-white rounded-[12px] shadow-[0px_4px_20px_0px] shadow-smoky13/10 border border-smoky4 py-1 overflow-hidden
            ${variant === "button" ? "w-44" : ""}`}
        >
          {header && (
            <p className="text-smoky6 text-[11px] font-medium px-3 pt-2 pb-1 uppercase tracking-wide">
              {header}
            </p>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] transition-colors
                ${opt.value === value
                  ? "bg-blue50 text-blue500 font-medium"
                  : "text-smoky9 hover:bg-smoky3 hover:text-smoky13"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
