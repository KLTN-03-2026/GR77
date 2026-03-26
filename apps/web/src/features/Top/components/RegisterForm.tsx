"use client";

import React, { useState } from "react";

interface RegisterFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RegisterForm({
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  isLoading, error, onSubmit
}: RegisterFormProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-5xl">
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-sm">
          {error}
        </div>
      )}

      {/* 2: Email */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
        <div className="lg:col-span-3">
          <label className="text-xl font-bold">Email</label>
        </div>
        <div className="lg:col-span-9">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white rounded-none px-6 py-3 text-gray-800 outline-none shadow-sm focus:ring-2 focus:ring-blue-300 transition-all"
          />
        </div>
      </div>

      {/* 3: Password */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
        <div className="lg:col-span-3">
          <label className="text-xl font-bold">Password</label>
        </div>
        <div className="lg:col-span-9">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white rounded-none px-6 py-3 text-gray-800 outline-none shadow-sm focus:ring-2 focus:ring-blue-300 transition-all"
          />
        </div>
      </div>

      {/* 4: Confirm Password */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
        <div className="lg:col-span-3">
          <label className="text-xl font-bold leading-tight">Confirm Password</label>
        </div>
        <div className="lg:col-span-9">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-white rounded-none px-6 py-3 text-gray-800 outline-none shadow-sm focus:ring-2 focus:ring-blue-300 transition-all"
          />
        </div>
      </div>

      {/* 5: Checkbox & Button */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 pt-4">
        <div className="lg:col-start-4 lg:col-span-9 space-y-8 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="terms-check" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-6 h-6 accent-green-500 rounded border-none cursor-pointer" />
            <label htmlFor="terms-check" className="text-xs lg:text-sm cursor-pointer opacity-95">
              I agree to the Terms of Service and Privacy Policy. <a href="/login" className="underline ml-2 hover:text-white/80 transition-colors">Login</a>
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
