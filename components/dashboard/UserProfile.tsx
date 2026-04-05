"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { inputCls, labelCls } from "@/lib/styles";
import Snackbar from "@/components/ui/Snackbar";
import { authedFetcher, apiFetch } from "@/lib/fetcher";

export interface ResumeLink {
  id: string;
  name: string;
  url: string;
}

interface ProfileData {
  displayName: string;
  intro: string;
  resumeLinks: ResumeLink[];
  avatarUrl: string;
}

function ConfirmModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[380px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">Save Profile</h3>
        <p className="text-smoky7 text-[14px] mb-6">Save changes to your profile?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 text-white text-[14px] font-bold transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="text-blue500">{icon}</span>
      <span className="text-smoky13 text-[13px] font-semibold uppercase tracking-wide">{title}</span>
    </div>
  );
}

export default function UserProfile() {
  const { data, mutate } = useSWR<{ data: ProfileData }>("/api/profile", authedFetcher);
  const profile = data?.data;

  const [displayName, setDisplayName] = useState("");
  const [intro, setIntro]             = useState("");
  const [resumeLinks, setResumeLinks] = useState<ResumeLink[]>([]);
  const [avatarUrl, setAvatarUrl]     = useState("");
  const [linkName, setLinkName]       = useState("");
  const [linkUrl, setLinkUrl]         = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [snackbar, setSnackbar]       = useState<{ variant: "success" | "error"; message: string } | null>(null);
  function showSnack(v: "success" | "error", msg: string) { setSnackbar({ variant: v, message: msg }); }
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setIntro(profile.intro);
    setResumeLinks(profile.resumeLinks ?? []);
    setAvatarUrl(profile.avatarUrl ?? "");
  }, [profile?.displayName]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      showSnack("error", "Image must be under 1 MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") setAvatarUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function addLink() {
    if (!linkName.trim() || !linkUrl.trim()) return;
    setResumeLinks((prev) => [...prev, { id: String(Date.now()), name: linkName.trim(), url: linkUrl.trim() }]);
    setLinkName("");
    setLinkUrl("");
  }

  function removeLink(id: string) {
    setResumeLinks((prev) => prev.filter((l) => l.id !== id));
  }

  async function commitSave() {
    try {
      await apiFetch("/api/profile", { method: "PUT", json: { displayName, intro, resumeLinks, avatarUrl } });
      mutate();
      showSnack("success", "Profile saved");
    } catch {
      showSnack("error", "Failed to save profile");
    } finally {
      setShowConfirm(false);
    }
  }

  const initials = displayName.trim()
    ? displayName.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="bg-white shadow-[0px_4px_15px_0px] shadow-smoky13/[5%] px-8 py-5 flex items-center justify-between">
        <span className="font-bold text-smoky13 text-[22px]">
          Profile<span className="text-blue500">.</span>
        </span>
        <button onClick={() => setShowConfirm(true)}
          className="px-4 py-2 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors">
          Save
        </button>
      </div>

      <div className="flex-1 p-8 flex gap-6 items-start">

        {/* ── Left: Preview card (sticky) ── */}
        <div className="w-[280px] shrink-0 sticky top-0 flex flex-col gap-4">
          <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] overflow-hidden">
            {/* Banner */}
            <div className="h-[80px] bg-gradient-to-br from-blue500/20 via-blue100/40 to-blue50 relative">
              <div className="absolute inset-0"
                style={{ backgroundImage: "radial-gradient(circle at 20% 70%, #258CF240 0%, transparent 60%), radial-gradient(circle at 85% 20%, #BBDBFB60 0%, transparent 55%)" }} />
            </div>
            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="flex items-end gap-3 -mt-8 mb-4">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="group relative w-[64px] h-[64px] rounded-[18px] shrink-0 shadow-[0px_4px_14px_0px] shadow-blue500/25 ring-[3px] ring-white overflow-hidden focus:outline-none">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue500 flex items-center justify-center text-white text-[22px] font-bold">
                      {initials}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-smoky13/55 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white">
                      <path d="M11 2l3 3-8.5 8.5H2v-3L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-white text-[9px] font-bold tracking-wide">EDIT</span>
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                {avatarUrl && (
                  <button type="button" onClick={() => setAvatarUrl("")}
                    className="text-smoky6 hover:text-error text-[11px] transition-colors mb-0.5 self-end">
                    Remove
                  </button>
                )}
              </div>
              <p className="text-smoky13 font-bold text-[18px] leading-snug truncate">
                {displayName.trim() || <span className="text-smoky5 font-normal text-[15px]">Your Name</span>}
              </p>
              <p className="text-smoky7 text-[13px] mt-1.5 leading-relaxed line-clamp-4">
                {intro.trim() || <span className="text-smoky4 text-[12px]">No intro yet.</span>}
              </p>
            </div>
          </div>

          {/* Resume links preview */}
          {resumeLinks.length > 0 && (
            <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] p-5">
              <p className="text-smoky6 text-[11px] font-semibold uppercase tracking-wide mb-3">Resume Links</p>
              <div className="flex flex-col gap-2">
                {resumeLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 group">
                    <div className="w-6 h-6 rounded-[6px] bg-blue50 flex items-center justify-center shrink-0">
                      <svg className="text-blue500" width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M4 7.5a2.5 2.5 0 0 0 3.5 0l1.5-1.5a2.5 2.5 0 0 0-3.5-3.5L5 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <path d="M7 3.5a2.5 2.5 0 0 0-3.5 0L2 5a2.5 2.5 0 0 0 3.5 3.5L6 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="text-blue500 text-[12px] truncate group-hover:underline">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Edit form ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* Identity section */}
          <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] p-8">
            <SectionHeading title="Identity" icon={
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M1.5 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            } />
            <div className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Intro</label>
                <textarea value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="A short bio or description..." rows={4}
                  className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Resume links section */}
          <div className="bg-white rounded-[20px] shadow-[0px_0px_15px_0px] shadow-smoky13/[4%] p-8">
            <SectionHeading title="Resume Links" icon={
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M5 9a3 3 0 0 0 4.5 0L11 7.5A3.182 3.182 0 0 0 6.5 3L5.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M10 6a3 3 0 0 0-4.5 0L4 7.5A3.182 3.182 0 0 0 8.5 12l1-.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            } />

            <div className="flex items-start gap-3 bg-blue50 rounded-[12px] px-4 py-3 mb-5">
              <svg className="text-blue500 shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-blue700 text-[13px] leading-relaxed">
                We do not store files. Add links to your resume, portfolio, or any other resources below.
              </p>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <input type="text" value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="Label"
                className="rounded-[10px] outline outline-1 outline-smoky5 px-3 py-2.5 text-[13px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all w-[140px] shrink-0" />
              <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addLink(); }}
                placeholder="https://"
                className="flex-1 rounded-[10px] outline outline-1 outline-smoky5 px-3 py-2.5 text-[13px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all" />
              <button onClick={addLink}
                className="px-4 py-2.5 rounded-[10px] bg-blue500 hover:bg-blue600 text-white text-[13px] font-semibold transition-colors shrink-0">
                Add
              </button>
            </div>

            {resumeLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <svg className="text-smoky5" width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M11 17a6 6 0 0 0 8.5 0l2.5-2.5a6.364 6.364 0 0 0-9-9L11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M17 11a6 6 0 0 0-8.5 0L6 13.5a6.364 6.364 0 0 0 9 9L16.5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                <p className="text-smoky6 text-[13px]">No links added yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {resumeLinks.map((link) => (
                  <div key={link.id} className="group flex items-center gap-3 rounded-[12px] bg-smoky3 hover:bg-smoky4 px-4 py-3 transition-colors">
                    <div className="w-7 h-7 rounded-[8px] bg-blue50 flex items-center justify-center shrink-0">
                      <svg className="text-blue500" width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M5 8a3 3 0 0 0 4.5 0L11 6.5A3.182 3.182 0 0 0 6.5 2L5.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        <path d="M8 5a3 3 0 0 0-4.5 0L2 6.5A3.182 3.182 0 0 0 6.5 11l1-.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="text-smoky9 text-[13px] font-medium w-[120px] shrink-0 truncate">{link.name}</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-blue500 text-[13px] truncate hover:underline">
                      {link.url}
                    </a>
                    <button onClick={() => removeLink(link.id)}
                      className="opacity-0 group-hover:opacity-100 text-smoky5 hover:text-error transition-all shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && <ConfirmModal onConfirm={commitSave} onClose={() => setShowConfirm(false)} />}
      {snackbar && <Snackbar variant={snackbar.variant} message={snackbar.message} onDone={() => setSnackbar(null)} />}
    </div>
  );
}
