"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

const TOOLBAR = [
  { label: "B", title: "Bold", syntax: "**", wrap: true },
  { label: "I", title: "Italic", syntax: "*", wrap: true },
  { label: "H1", title: "Heading 1", syntax: "# ", wrap: false, line: true },
  { label: "H2", title: "Heading 2", syntax: "## ", wrap: false, line: true },
  { label: "H3", title: "Heading 3", syntax: "### ", wrap: false, line: true },
  { label: "—", title: "Divider", syntax: "\n---\n", wrap: false, insert: true },
  { label: "•", title: "Bullet list", syntax: "- ", wrap: false, line: true },
  { label: "1.", title: "Numbered list", syntax: "1. ", wrap: false, line: true },
  { label: "`", title: "Inline code", syntax: "`", wrap: true },
  { label: "```", title: "Code block", syntax: "```", wrap: true, block: true },
  { label: "🔗", title: "Link", syntax: "link", wrap: false, special: "link" },
];

function applyToolbar(textarea: HTMLTextAreaElement, item: typeof TOOLBAR[number], setValue: (v: string) => void) {
  const start = textarea.selectionStart, end = textarea.selectionEnd;
  const text = textarea.value, sel = text.slice(start, end);
  let before = "", after = "", mid = sel;
  if (item.special === "link") { before = "["; after = "](https://)"; mid = sel || "link text"; }
  else if (item.insert) { before = item.syntax; after = ""; mid = ""; }
  else if (item.block) { before = "```\n"; after = "\n```"; mid = sel || "code"; }
  else if (item.line) { before = "\n" + item.syntax; after = ""; mid = sel || ""; }
  else if (item.wrap) { before = item.syntax; after = item.syntax; mid = sel || "text"; }
  const newValue = text.slice(0, start) + before + mid + after + text.slice(end);
  setValue(newValue);
  requestAnimationFrame(() => { textarea.setSelectionRange(start + before.length, start + before.length + mid.length); textarea.focus(); });
}

interface Props {
  notes: string;
  onChange: (v: string) => void;
}

export default function NotesTab({ notes, onChange }: Props) {
  const [preview, setPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function enterEdit() {
    setPreview(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  return (
    <div className="flex flex-col">
      {!preview && (
        <div className="flex items-center gap-1 px-6 py-3 border-b border-smoky4 bg-smoky2 flex-wrap">
          {TOOLBAR.map((item) => (
            <button key={item.title} title={item.title}
              onMouseDown={(e) => { e.preventDefault(); if (textareaRef.current) applyToolbar(textareaRef.current, item, onChange); }}
              className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium text-smoky8 hover:bg-smoky4 hover:text-smoky13 transition-colors font-mono">
              {item.label}
            </button>
          ))}
        </div>
      )}
      {preview ? (
        <div onClick={enterEdit}
          className="px-6 py-5 min-h-[400px] cursor-text prose prose-sm max-w-none text-smoky13
            [&_h1]:text-[22px] [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-5
            [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4
            [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3
            [&_p]:text-[14px] [&_p]:mb-2 [&_p]:text-smoky9
            [&_ul]:pl-5 [&_ul]:mb-2 [&_ul_li]:text-[14px] [&_ul_li]:text-smoky9 [&_ul_li]:list-disc
            [&_ol]:pl-5 [&_ol]:mb-2 [&_ol_li]:text-[14px] [&_ol_li]:text-smoky9 [&_ol_li]:list-decimal
            [&_code]:bg-smoky4 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[13px] [&_code]:font-mono
            [&_pre]:bg-smoky12 [&_pre]:text-smoky3 [&_pre]:rounded-[10px] [&_pre]:p-4 [&_pre]:mb-3 [&_pre]:overflow-x-auto
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
            [&_a]:text-blue500 [&_a]:underline [&_hr]:border-smoky4 [&_hr]:my-4
            [&_strong]:font-semibold [&_em]:italic">
          {notes.trim() ? <ReactMarkdown>{notes}</ReactMarkdown> : <p className="text-smoky6 text-[14px]">Click to start writing...</p>}
        </div>
      ) : (
        <textarea ref={textareaRef} value={notes} onChange={(e) => onChange(e.target.value)}
          onBlur={() => setPreview(true)}
          placeholder="Write your notes in markdown..."
          className="px-6 py-5 min-h-[400px] text-[14px] text-smoky13 placeholder:text-smoky6 font-mono outline-none resize-none bg-transparent" />
      )}
    </div>
  );
}
