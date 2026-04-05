import { create } from "zustand";

type Role = "admin" | "user";

interface AuthState {
  username: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  setAuth: (username: string, role: Role) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  username: null,
  role: null,
  isAuthenticated: false,
  setAuth: (username, role) => set({ username, role, isAuthenticated: true }),
  clearAuth: () => set({ username: null, role: null, isAuthenticated: false }),
}));
