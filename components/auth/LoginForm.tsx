"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { notifyRequestEnd, notifyRequestStart } from "@/lib/requestEvents";
import { useAuthStore } from "@/store/authStore";

async function loginFetcher(url: string, { arg }: { arg: { username: string; password: string } }) {
  notifyRequestStart();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(arg),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
  } finally {
    notifyRequestEnd();
  }
}

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/15 w-full max-w-[480px] p-8 relative">
        <button onClick={onClose}
          className="absolute top-5 right-5 text-smoky6 hover:text-smoky13 transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-1 mb-6">
          <span className="text-smoky13 font-bold text-[20px]">OppTracker</span>
          <span className="text-blue500 text-[26px] leading-none font-bold">.</span>
        </div>

        <h3 className="text-smoky13 font-bold text-[22px] mb-1">Password reset</h3>
        <p className="text-smoky7 text-[14px] mb-6 leading-relaxed">
          Only an admin can manage user accounts and reset passwords.
        </p>

        <div className="rounded-[14px] bg-blue50 border border-blue100 px-5 py-4 mb-6">
          <p className="text-smoky13 text-[13px] font-semibold mb-1">Contact the admin</p>
          <p className="text-smoky7 text-[13px] leading-relaxed mb-2">
            Reach out to request a password reset.
          </p>
          <a href="mailto:work@divyanksingh.com"
            className="inline-flex items-center gap-1.5 text-blue500 text-[13px] font-medium hover:text-blue600 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 4.5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            work@divyanksingh.com
          </a>
        </div>

        <button onClick={onClose}
          className="w-full h-[48px] rounded-[12px] bg-smoky13 hover:bg-smoky12 text-white text-[14px] font-semibold transition-colors">
          Got it
        </button>
      </div>
    </div>
  );
}

function SignupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-smoky13/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[20px] shadow-[0px_8px_40px_0px] shadow-smoky13/15 w-full max-w-[480px] p-8 relative">
        <button onClick={onClose}
          className="absolute top-5 right-5 text-smoky6 hover:text-smoky13 transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-1 mb-6">
          <span className="text-smoky13 font-bold text-[20px]">OppTracker</span>
          <span className="text-blue500 text-[26px] leading-none font-bold">.</span>
        </div>

        <h3 className="text-smoky13 font-bold text-[22px] mb-1">This is a personal project.</h3>
        <p className="text-smoky7 text-[14px] mb-6 leading-relaxed">
          OppTracker is built for personal use. Account creation is not open to the public yet.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          <div className="rounded-[14px] bg-blue50 border border-blue100 px-5 py-4">
            <p className="text-smoky13 text-[13px] font-semibold mb-1">Want access to this instance?</p>
            <p className="text-smoky7 text-[13px] leading-relaxed mb-2">
              Email me to request a custom username and password.
            </p>
            <a href="mailto:work@divyanksingh.com"
              className="inline-flex items-center gap-1.5 text-blue500 text-[13px] font-medium hover:text-blue600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1 4.5l6 4 6-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              work@divyanksingh.com
            </a>
          </div>

          <div className="rounded-[14px] bg-smoky3 border border-smoky4 px-5 py-4">
            <p className="text-smoky13 text-[13px] font-semibold mb-1">Want your own instance?</p>
            <p className="text-smoky7 text-[13px] leading-relaxed">
              Fork or clone the repo and self-host it. You control your own data.
            </p>
          </div>

          <div className="rounded-[14px] bg-success/5 border border-success/20 px-5 py-4">
            <p className="text-smoky13 text-[13px] font-semibold mb-1">Just want to try it out?</p>
            <p className="text-smoky7 text-[13px] leading-relaxed">
              Use the test account to explore the app.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 bg-white border border-smoky4 rounded-[8px] px-3 py-1.5 text-[12px] font-mono text-smoky9">
                <span className="text-smoky6">user</span> testuser
              </span>
              <span className="flex items-center gap-1.5 bg-white border border-smoky4 rounded-[8px] px-3 py-1.5 text-[12px] font-mono text-smoky9">
                <span className="text-smoky6">pass</span> testpass
              </span>
            </div>
          </div>
        </div>

        <button onClick={onClose}
          className="w-full h-[48px] rounded-[12px] bg-smoky13 hover:bg-smoky12 text-white text-[14px] font-semibold transition-colors">
          Got it
        </button>
      </div>
    </div>
  );
}

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const { trigger, isMutating, error } = useSWRMutation("/api/auth/login", loginFetcher);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;

    const data = await trigger({ username, password });
    if (data) {
      setAuth(data.username, data.role);
      router.push(data.role === "admin" ? "/admin/users" : "/dashboard");
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex lg:hidden items-center gap-1 mb-10">
        <span className="text-smoky13 font-bold text-[22px]">OppTracker</span>
        <span className="text-blue500 text-[28px] leading-none font-bold">.</span>
      </div>

      <h2 className="text-smoky13 font-bold text-[28px]">Welcome back</h2>
      <p className="text-smoky7 text-[15px] mt-1 mb-8">Sign in to your account</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-5">
          <label className="block text-smoky8 text-[14px] font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full rounded-[12px] outline outline-1 outline-smoky5 px-5 py-4 text-[15px] text-smoky13 placeholder:text-smoky6 focus:outline-blue500 transition-all"
          />
        </div>

        <div className="mb-2">
          <label className="block text-smoky8 text-[14px] font-medium mb-2">
            Password
          </label>
          <div className="flex items-center w-full rounded-[12px] outline outline-1 outline-smoky5 px-5 focus-within:outline-blue500 transition-all">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="flex-1 py-4 text-[15px] text-smoky13 placeholder:text-smoky6 outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-smoky6 hover:text-smoky9 text-[13px] font-medium transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button type="button" onClick={() => setShowForgotPassword(true)} className="text-blue500 text-[13px] font-medium hover:text-blue600 transition-colors">
            Forgot password?
          </button>
        </div>

        {error && <p className="text-error text-[13px] mb-4">{error.message}</p>}

        <button
          type="submit"
          disabled={isMutating || !username || !password}
          className="w-full bg-blue500 hover:bg-blue600 active:bg-blue700 disabled:bg-smoky5 disabled:cursor-not-allowed text-white font-bold text-[16px] rounded-[12px] h-[56px] transition-colors cursor-pointer"
        >
          {isMutating ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-smoky7 text-[14px] mt-6">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => setShowSignup(true)}
          className="text-blue500 font-medium hover:text-blue600 transition-colors"
        >
          Sign up
        </button>
      </p>

      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </div>
  );
}
