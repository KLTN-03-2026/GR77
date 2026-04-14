"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants/endpoints";
import OtpInputGroup from "./OtpInputGroup";

interface OtpVerificationProps {
    email: string;
    timeLeft: number;
    cooldown: number;
    attemptsUsed: number;
    isLoading: boolean;
    onResend: () => void;
}

export default function OtpVerification({
    email,
    timeLeft,
    cooldown,
    attemptsUsed,
    isLoading,
    onResend,
}: OtpVerificationProps) {
    const router = useRouter();
    const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
    const [verifyError, setVerifyError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifySuccess, setVerifySuccess] = useState(false);

    const handleVerifyOtp = async (code: string) => {
        setIsVerifying(true);
        setVerifyError("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });
            if (!res.ok) {
                let errorMsg = "Invalid or expired verification code.";
                try {
                    const data = await res.json();
                    errorMsg = data.message || errorMsg;
                } catch (e) { }
                throw new Error(errorMsg);
            }
            setVerifySuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setVerifyError(err.message || "Verification failed. Please try again.");
            setOtpValues(["", "", "", "", "", ""]);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="register-page relative min-h-screen flex items-center justify-center overflow-hidden">
            <style jsx global>{`
                .register-page * { font-family: 'Inter', sans-serif; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .anim-up { animation: fadeInUp 0.6s ease-out both; }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .anim-gradient-bg {
                    background-size: 200% 200%;
                    animation: gradientShift 8s ease infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .shake { animation: shake 0.5s ease-in-out; }
                @keyframes successPulse {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .success-pulse { animation: successPulse 0.5s ease-out both; }
                .otp-input {
                    transition: all 0.2s ease;
                }
                .otp-input:focus {
                    border-color: #fff;
                    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
                    transform: scale(1.08);
                }
            `}</style>
            <div className="absolute inset-0 anim-gradient-bg" style={{ background: "linear-gradient(135deg, #0097d9 0%, #00AEEF 25%, #33c1f5 50%, #00AEEF 75%, #007bb5 100%)" }} />

            <div className="relative z-10 w-full max-w-[520px] px-6 py-12 anim-up">
                <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-10 shadow-2xl text-center">
                    {verifySuccess ? (
                        <>
                            <div className="flex justify-center mb-6 success-pulse">
                                <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white mb-3">Verification Successful!</h2>
                            <p className="text-white/90 text-lg mb-4">
                                Your account has been verified.
                            </p>
                            <p className="text-white/70 text-sm">
                                Redirecting to login page...
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
                                    <svg className="w-12 h-12 text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                We've sent a 6-digit verification code to{" "}
                                <span className="font-bold text-white underline decoration-white/30">{email}</span>.
                                <br />
                                Please check your inbox and enter the code below.
                            </p>

                            {/* OTP Input */}
                            <OtpInputGroup
                                otpValues={otpValues}
                                setOtpValues={setOtpValues}
                                onComplete={handleVerifyOtp}
                                isVerifying={isVerifying}
                                verifyError={verifyError}
                            />

                            {verifyError && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-white text-sm">
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

                            <div className="space-y-3 mt-6">
                                <button
                                    onClick={onResend}
                                    disabled={isLoading || cooldown > 0 || attemptsUsed >= 4}
                                    className="block w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/30 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive code? Resend"}
                                </button>
                                {attemptsUsed > 0 && (
                                    <p className="text-white/60 text-xs mt-2">
                                        Remaining attempts: {4 - attemptsUsed}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
