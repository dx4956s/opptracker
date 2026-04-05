import { create } from "zustand";

export interface ResumeLink {
  id: string;
  name: string;
  url: string;
}

interface UserProfileState {
  displayName: string;
  intro: string;
  resumeLinks: ResumeLink[];
  avatarUrl: string;
  update: (data: Partial<Pick<UserProfileState, "displayName" | "intro" | "resumeLinks" | "avatarUrl">>) => void;
}

export const useUserProfileStore = create<UserProfileState>()((set) => ({
  displayName: "",
  intro: "",
  resumeLinks: [],
  avatarUrl: "",
  update: (data) => set((s) => ({ ...s, ...data })),
}));
