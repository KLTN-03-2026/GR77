"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOTP } from "../hooks/useOTP";
import { useTimer } from "../hooks/useTimer";

interface OTPInputProps {
  email: string;
  onResend: () => Promise<boolean>;
  isLoadingResend: boolean;
  cooldown: number;
  attemptsUsed: number;
}

export default function OTPInput({ 
  email, 
  onResend, 
  isLoadingResend, 
  cooldown, 
  attemptsUsed 
}: OTPInputProps) {
  const router = useRouter();

  const {
    otpValues,
    verifyError,
    isVerifying,
    verifySuccess,
    handleChange,
    handleKeyDown,
    handlePaste
  } = useOTP(email);

  const { timeLeft, setTimeLeft } = useTimer(300, !verifySuccess);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Navigation: component handles redirect after successful verification
  useEffect(() => {
    if (verifySuccess) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [verifySuccess, router]);

  const handleResendPress = async () => {
    const success = await onResend();
    if (success) {
      setTimeLeft(300);
    }
  };

  if (verifySuccess) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto flex flex-col items-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Verification Successful!</h2>
          <p className="text-white/90 text-lg mb-4">Your account has been verified.</p>
          <p className="text-white/70 text-sm">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto flex flex-col items-center">
      <div className="text-center w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Enter Verification Code</h2>
        <div className="flex justify-center mb-4">
          <div className="bg-white/10 px-4 py-2 rounded-full border border-white/20 text-white font-mono text-xl">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        </div>
        <p className="text-white/90 text-base mb-8 leading-relaxed">
          We've sent a 6-digit verification code to <span className="font-bold underline text-white">{email}</span>.
        </p>

        <div className={`flex justify-center gap-2 lg:gap-3 mb-6 ${verifyError ? "shake" : ""}`}>
          {otpValues.map((digit, index) => (
            <input
              key={index}
              ref={otpRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value, otpRefs)}
              onKeyDown={(e) => handleKeyDown(index, e, otpRefs)}
              onPaste={index === 0 ? (e) => handlePaste(e, otpRefs) : undefined}
              disabled={isVerifying}
              className="otp-input w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-white/20 border-2 border-white/30 rounded-xl text-white outline-none backdrop-blur-sm placeholder-white/30 disabled:opacity-50"
              placeholder="·"
            />
          ))}
        </div>

        {verifyError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-white text-sm w-full max-w-md mx-auto">
            {verifyError}
          </div>
        )}

        {isVerifying && (
          <div className="mb-4 flex items-center justify-center gap-2 text-white/90">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">Verifying...</span>
          </div>
        )}

        <div className="space-y-3 mt-6 max-w-md mx-auto">
          <button
            onClick={handleResendPress}
            disabled={isLoadingResend || cooldown > 0 || attemptsUsed >= 4}
            className="block w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/30 transition-all disabled:opacity-50"
          >
            {isLoadingResend ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive code? Resend"}
          </button>
          {attemptsUsed > 0 && (
            <p className="text-white/60 text-xs mt-2">
              Remaining attempts: {4 - attemptsUsed}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
