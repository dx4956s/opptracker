"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_HEADERS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface Props {
  value: string; // YYYY-MM-DD or ""
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Select date" }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const today = new Date();
  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      setStyle(
        spaceBelow > 320
          ? { top: r.bottom + 4, left: r.left }
          : { bottom: window.innerHeight - r.top + 4, left: r.left }
      );
    }
  }, [open]);

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

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  // Build grid cells
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthDays - i, current: false });
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ day: i, current: true });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false });

  const selectedDay = parsed?.getFullYear() === viewYear && parsed?.getMonth() === viewMonth
    ? parsed.getDate() : null;
  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth
    ? today.getDate() : null;

  const display = parsed
    ? `${String(parsed.getDate()).padStart(2,"0")}/${String(parsed.getMonth()+1).padStart(2,"0")}/${parsed.getFullYear()}`
    : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full rounded-[12px] outline outline-1 px-4 py-3 text-[14px] flex items-center justify-between transition-all
          ${open ? "outline-blue500" : "outline-smoky5 hover:outline-smoky7"}`}
      >
        <span className={display ? "text-smoky13" : "text-smoky6"}>
          {display ?? placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-smoky6 shrink-0">
          <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={popRef}
          style={style}
          className="fixed z-50 bg-white rounded-[16px] shadow-[0px_8px_32px_0px] shadow-smoky13/10 border border-smoky4 p-4 w-[272px]"
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-smoky6 hover:bg-smoky3 hover:text-smoky13 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-[14px] font-semibold text-smoky13">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-smoky6 hover:bg-smoky3 hover:text-smoky13 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map((d) => (
              <span key={d} className="text-center text-[11px] font-semibold text-smoky6 py-1">{d}</span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell, i) => {
              const isSelected = cell.current && cell.day === selectedDay;
              const isToday = cell.current && cell.day === todayDay;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!cell.current}
                  onClick={() => selectDay(cell.day)}
                  className={`h-8 w-full rounded-[6px] text-[13px] transition-colors
                    ${!cell.current ? "text-smoky5 cursor-default" : ""}
                    ${isSelected ? "bg-blue500 text-white font-semibold" : ""}
                    ${isToday && !isSelected ? "ring-1 ring-blue500 text-blue500 font-semibold" : ""}
                    ${cell.current && !isSelected ? "hover:bg-smoky3 text-smoky9" : ""}
                  `}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {value && (
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className="mt-3 w-full text-[12px] text-smoky6 hover:text-error transition-colors py-1 text-center"
            >
              Clear date
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
