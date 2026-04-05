"use client";

import { useState } from "react";

export interface LinkItem {
  id: string;
  name: string;
  url: string;
}

interface Props {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
  resourceLabel?: string;
}

export default function LinksTab({ links, onChange, resourceLabel = "project" }: Props) {
  const [name, setName] = useState(""), [url, setUrl] = useState("");

  function addLink() {
    if (!name.trim() || !url.trim()) return;
    onChange([...links, { id: String(Date.now()), name: name.trim(), url: url.trim() }]);
    setName(""); setUrl("");
  }

  return (
    <div className="px-6 py-5 flex flex-col gap-5">
      <div className="flex items-start gap-3 bg-smoky3 rounded-[12px] px-4 py-3">
        <svg className="text-smoky6 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-smoky7 text-[13px] leading-relaxed">We do not save files. Add links below to reference documents or resources related to this {resourceLabel}.</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Label (e.g. Brief PDF)"
          className="rounded-[10px] outline outline-1 outline-smoky5 px-3 py-2.5 text-[13px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all w-[160px]" />
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addLink(); }} placeholder="URL"
          className="flex-1 rounded-[10px] outline outline-1 outline-smoky5 px-3 py-2.5 text-[13px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all" />
        <button onClick={addLink} className="px-3 py-2.5 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors shrink-0">Add</button>
      </div>
      {links.length === 0 ? (
        <p className="text-smoky6 text-[13px] text-center py-8">No links added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-3 rounded-[10px] outline outline-1 outline-smoky4 px-4 py-3">
              <svg className="text-smoky6 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 8.5a3.5 3.5 0 0 0 5 0l1.5-1.5a3.536 3.536 0 0 0-5-5L6 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M8.5 5.5a3.5 3.5 0 0 0-5 0L2 7a3.536 3.536 0 0 0 5 5L8 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-smoky8 text-[13px] font-medium w-[140px] shrink-0 truncate">{link.name}</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-blue500 text-[13px] truncate hover:underline">{link.url}</a>
              <button onClick={() => onChange(links.filter((l) => l.id !== link.id))} className="text-smoky5 hover:text-error transition-colors shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
