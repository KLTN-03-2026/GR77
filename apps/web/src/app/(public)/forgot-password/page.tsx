"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    // Step 1: Send reset code
    const handleSendResetCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`${apiUrl}/auth/send-reset-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to send reset code");
            }

            setSuccessMessage("Reset code sent to your email. Check your inbox.");
            setStep("code");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify reset code
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`${apiUrl}/auth/verify-reset-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Invalid or expired code");
            }

            setSuccessMessage("Code verified! Now create your new password.");
            setStep("password");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to reset password");
            }

            setSuccessMessage("Password reset successfully! Redirecting to login...");
            setStep("success");

            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .forgot-password-page * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes floatDelay {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.92); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.92); opacity: 0.5; }
        }

        .anim-gradient-bg {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        .anim-float { animation: float 6s ease-in-out infinite; }
        .anim-float-d { animation: floatDelay 6s 2s ease-in-out infinite; }
        .anim-pulse-ring { animation: pulseRing 4s ease-in-out infinite; }
        .anim-up-0 { animation: fadeInUp 0.6s ease-out both; }
        .anim-up-1 { animation: fadeInUp 0.6s 0.08s ease-out both; }
        .anim-up-2 { animation: fadeInUp 0.6s 0.16s ease-out both; }
        .anim-up-3 { animation: fadeInUp 0.6s 0.24s ease-out both; }
        .anim-up-4 { animation: fadeInUp 0.6s 0.32s ease-out both; }
        .anim-up-5 { animation: fadeInUp 0.6s 0.40s ease-out both; }

        .field-input {
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .field-input:focus {
          border-color: #00AEEF;
          box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.25);
        }

        .btn-submit {
          transition: all 0.25s ease;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        .btn-submit:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
      `}</style>

            <div className="forgot-password-page relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div
                    className="absolute inset-0 anim-gradient-bg"
                    style={{
                        background: "linear-gradient(135deg, #0097d9 0%, #00AEEF 25%, #33c1f5 50%, #00AEEF 75%, #007bb5 100%)",
                    }}
                />

                {/* Decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[8%] left-[6%] w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 anim-float" />
                    <div className="absolute top-[20%] right-[8%] w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-white/8 anim-float-d" />
                    <div className="absolute bottom-[12%] left-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/8 anim-float" style={{ animationDelay: "1s" }} />
                    <div className="absolute bottom-[30%] right-[6%] w-12 h-12 sm:w-18 sm:h-18 rounded-full bg-white/6 anim-float-d" />
                    <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-36 h-36 sm:w-52 sm:h-52 rounded-full border border-white/10 anim-pulse-ring" />
                    <div className="absolute top-[57%] left-[50%] -translate-x-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-white/5 anim-pulse-ring" style={{ animationDelay: "1.5s" }} />

                    <div className="absolute top-[15%] left-[45%] w-2 h-2 rounded-full bg-white/25" />
                    <div className="absolute top-[40%] left-[18%] w-2 h-2 rounded-full bg-white/20" />
                    <div className="absolute bottom-[22%] right-[25%] w-2 h-2 rounded-full bg-white/20" />
                    <div className="absolute bottom-[40%] left-[55%] w-1.5 h-1.5 rounded-full bg-white/25" />
                    <div className="absolute top-[35%] right-[35%] w-1.5 h-1.5 rounded-full bg-white/15" />
                </div>

                {/* Form Content */}
                <div className="relative z-10 w-full max-w-[440px] px-5 sm:px-6 py-12 sm:py-16">
                    {/* Badge */}
                    <div className="flex justify-center mb-4 anim-up-0">
                        <div className="px-5 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-white/25 bg-white/15 backdrop-blur-sm text-white">
                            Reset Your Password
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white mb-2 anim-up-1 tracking-tight">
                        {step === "email" && "Forgot Password?"}
                        {step === "code" && "Verify Code"}
                        {step === "password" && "Create New Password"}
                        {step === "success" && "Password Reset!"}
                    </h1>

                    <p className="text-center text-white/70 mb-8 anim-up-2 text-sm">
                        {step === "email" && "Enter your email address and we'll send you a code to reset your password."}
                        {step === "code" && "Enter the verification code sent to your email."}
                        {step === "password" && "Create a strong new password."}
                        {step === "success" && "Your password has been reset successfully!"}
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-sm mb-4 anim-up-2">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-white text-sm mb-4 anim-up-2">
                            {successMessage}
                        </div>
                    )}

                    {/* Step 1: Email Input */}
                    {step === "email" && (
                        <form onSubmit={handleSendResetCode} className="space-y-5">
                            <div className="anim-up-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none text-[15px] placeholder-gray-400 shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-submit w-full py-3.5 bg-white text-[#00AEEF] font-bold text-[15px] rounded-full shadow-lg disabled:opacity-60 disabled:cursor-not-allowed anim-up-3"
                            >
                                {isLoading ? "Sending..." : "Send Reset Code"}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Code Verification */}
                    {step === "code" && (
                        <form onSubmit={handleVerifyCode} className="space-y-5">
                            <div className="anim-up-2">
                                <label htmlFor="code" className="block text-sm font-semibold text-white mb-2">
                                    Verification Code
                                </label>
                                <input
                                    id="code"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none text-[15px] placeholder-gray-400 shadow-sm text-center tracking-widest"
                                />
                                <p className="text-white/60 text-xs mt-2">Enter the 6-digit code sent to your email</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || code.length !== 6}
                                className="btn-submit w-full py-3.5 bg-white text-[#00AEEF] font-bold text-[15px] rounded-full shadow-lg disabled:opacity-60 disabled:cursor-not-allowed anim-up-3"
                            >
                                {isLoading ? "Verifying..." : "Verify Code"}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Password Reset */}
                    {step === "password" && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {/* New Password */}
                            <div className="anim-up-2">
                                <label htmlFor="new-password" className="block text-sm font-semibold text-white mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none pr-11 text-[15px] placeholder-gray-400 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="text-white/60 text-xs mt-2">At least 8 characters</p>
                            </div>

                            {/* Confirm Password */}
                            <div className="anim-up-3">
                                <label htmlFor="confirm-password" className="block text-sm font-semibold text-white mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none pr-11 text-[15px] placeholder-gray-400 shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-submit w-full py-3.5 bg-white text-[#00AEEF] font-bold text-[15px] rounded-full shadow-lg disabled:opacity-60 disabled:cursor-not-allowed anim-up-4"
                            >
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === "success" && (
                        <div className="text-center">
                            <div className="mb-6 anim-up-2">
                                <svg className="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-white/80 mb-6 anim-up-3">
                                Redirecting to login page...
                            </p>
                        </div>
                    )}

                    {/* Back to Login Link */}
                    <div className="mt-6 text-center anim-up-5">
                        <Link href="/login" className="text-white hover:text-white/80 transition-colors text-sm font-semibold">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
