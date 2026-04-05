"use client";

import { useState, useEffect } from "react";

interface UserPayload {
  username: string;
  password: string;
  role: "admin" | "user";
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserPayload) => Promise<void>;
  initial?: { username: string; role: "admin" | "user" };
  loading: boolean;
  error?: string;
}

export default function UserModal({ open, onClose, onSubmit, initial, loading, error }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setUsername(initial?.username ?? "");
      setPassword("");
      setRole(initial?.role ?? "user");
    }
  }, [open, initial]);

  if (!open) return null;

  const isEdit = !!initial;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || (!isEdit && !password)) return;
    await onSubmit({ username, password, role });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/40 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/10 w-full max-w-[440px] p-8">
        <h3 className="text-smoky13 font-bold text-[20px] mb-1">
          {isEdit ? "Edit User" : "Create User"}
        </h3>
        <p className="text-smoky7 text-[14px] mb-6">
          {isEdit ? "Update user details." : "Add a new user to the system."}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">
              Password {isEdit && <span className="text-smoky6 font-normal">(leave blank to keep current)</span>}
            </label>
            <div className="flex items-center w-full rounded-[12px] outline outline-1 outline-smoky5 px-4 focus-within:outline-blue500 transition-all">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "New password" : "Enter password"}
                className="flex-1 py-3 text-[14px] text-smoky13 placeholder:text-smoky6 outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-smoky6 hover:text-smoky9 text-[12px] font-medium transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-smoky8 text-[13px] font-medium mb-2">Role</label>
            <div className="flex gap-3">
              {(["user", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 rounded-[12px] text-[14px] font-medium border transition-all capitalize ${
                    role === r
                      ? "bg-blue50 border-blue500 text-blue700"
                      : "bg-white border-smoky5 text-smoky7 hover:border-smoky6"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-error text-[13px] mb-4">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[48px] rounded-[12px] border border-smoky5 text-smoky8 text-[14px] font-medium hover:bg-smoky3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-[48px] rounded-[12px] bg-blue500 hover:bg-blue600 disabled:bg-smoky5 disabled:cursor-not-allowed text-white text-[14px] font-bold transition-colors"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
