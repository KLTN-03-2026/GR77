"use client";

import React, { useState } from "react";
import { validateEmail, validatePassword } from "@/lib/validation/auth";

interface RegisterFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isLoading: boolean;
  error: string;
  fieldErrors: { email?: string; password?: string; confirmPassword?: string };
  setFieldErrors: React.Dispatch<React.SetStateAction<{ email?: string; password?: string; confirmPassword?: string }>>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RegisterForm({
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  isLoading, error,
  fieldErrors, setFieldErrors,
  onSubmit
}: RegisterFormProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-5xl" noValidate>
      {error && (
        <div className="p-4 bg-red-800/20 border border-red-700/80 rounded-xl text-white text-sm">
          {error}
        </div>
      )}

      {/* 2: Email */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
        <div className="lg:col-span-3 flex items-center gap-2">
          <label className="text-xl font-bold">Email</label>
        </div>
        <div className="lg:col-span-9">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              const val = e.target.value;
              setEmail(val);
              const err = validateEmail(val);
              setFieldErrors(prev => ({ ...prev, email: err || undefined }));
            }}
            required
            className={`w-full bg-white rounded-none px-6 py-3 text-gray-800 outline-none shadow-sm focus:ring-2 focus:ring-blue-300 transition-all border ${fieldErrors.email ? 'border-red-700 bg-red-50' : 'border-gray-100'}`}
          />
          <div className={`flex items-center gap-1.5 mt-1.5 h-[22px] px-2.5 py-0.5 rounded-[3px] border border-gray-200 bg-white shadow-sm text-[12px] text-red-600 font-medium ${fieldErrors.email ? 'visible' : 'invisible'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" className="shrink-0"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
            <span>{fieldErrors.email || '\u00A0'}</span>
          </div>
        </div>
      </div>

      {/* 3: Password */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
        <div className="lg:col-span-3 flex items-center gap-2">
          <label className="text-xl font-bold">Password</label>
        </div>
        <div className="lg:col-span-9">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              const err = validatePassword(val);
              setFieldErrors(prev => ({ ...prev, password: err || undefined }));

              if (confirmPassword && val !== confirmPassword) {
                setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match." }));
              } else if (confirmPassword) {
                setFieldErrors(prev => {
                  const next = { ...prev };
                  delete next.confirmPassword;
                  return next;
                });
              }
            }}
            required
            className={`w-full bg-white rounded-none px-6 py-3 text-gray-800 outline-none shadow-sm focus:ring-2 focus:ring-blue-300 transition-all border ${fieldErrors.password ? 'border-red-700 bg-red-50' : 'border-gray-100'}`}
          />
          <div className={`flex items-center gap-1.5 mt-1.5 h-[22px] px-2.5 py-0.5 rounded-[3px] border border-gray-200 bg-white shadow-sm text-[12px] text-red-600 font-medium ${fieldErrors.password ? 'visible' : 'invisible'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" className="shrink-0"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
            <span>{fieldErrors.password || '\u00A0'}</span>
          </div>
        </div>
      </div>

      {/* 4: Confirm Password */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
        <div className="lg:col-span-3 flex items-center gap-2">
          <label className="text-xl font-bold leading-tight">Confirm Password</label>
        </div>
        <div className="lg:col-span-9">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              const val = e.target.value;
              setConfirmPassword(val);
              if (val !== password) {
                setFieldErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match." }));
              } else {
                setFieldErrors(prev => {
                  const next = { ...prev };
                  delete next.confirmPassword;
                  return next;
                });
              }
            }}
            required
            className={`w-full bg-white rounded-none px-6 py-3 text-gray-800 outline-none shadow-sm focus:ring-2 focus:ring-blue-300 transition-all border ${fieldErrors.confirmPassword ? 'border-red-700 bg-red-50' : 'border-gray-100'}`}
          />
          <div className={`flex items-center gap-1.5 mt-1.5 h-[22px] px-2.5 py-0.5 rounded-[3px] border border-gray-200 bg-white shadow-sm text-[12px] text-red-600 font-medium ${fieldErrors.confirmPassword ? 'visible' : 'invisible'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" className="shrink-0"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
            <span>{fieldErrors.confirmPassword || '\u00A0'}</span>
          </div>
        </div>
      </div>

      {/* 5: Checkbox & Button */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 pt-4">
        <div className="lg:col-start-4 lg:col-span-9 space-y-8 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="terms-check" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-6 h-6 accent-green-500 rounded border-none cursor-pointer" />
            <label htmlFor="terms-check" className="text-xs lg:text-sm cursor-pointer opacity-95">
              I agree to the <a href="/policies" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80 transition-colors">Terms of Service and Privacy Policy</a>. <a href="/login" className="underline ml-2 hover:text-white/80 transition-colors">Login</a>
            </label>
          </div>

          <div className="flex justify-center w-full">
            <button
              type="submit"
              disabled={isLoading || !agreed}
              className={`px-24 py-4 bg-white text-blue-900 font-bold text-xl rounded-full shadow-2xl transition-all border border-gray-100 italic ${isLoading || !agreed ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 hover:scale-105 active:scale-95"}`}
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
