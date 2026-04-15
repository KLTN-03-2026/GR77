"use client";

import React, { useState } from "react";
import Link from "next/link";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { validateEmail } from "@/lib/validation/auth";

interface LoginFormProps {
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    isLoading: boolean;
    error: string;
    fieldErrors: { email?: string; password?: string };
    setFieldErrors: React.Dispatch<React.SetStateAction<{ email?: string; password?: string }>>;
    rememberMe: boolean;
    setRememberMe: (val: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
    email, setEmail,
    password, setPassword,
    isLoading, error,
    fieldErrors, setFieldErrors,
    rememberMe, setRememberMe,
    onSubmit,
}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="h-screen min-h-screen flex items-center relative overflow-hidden font-sans
            bg-[url('/images/background/mobile.svg')] lg:bg-[url('/images/background/desktop.svg')] bg-cover bg-center">

            {/* ── Logo ── */}
            <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-7 lg:top-5 z-20">
                <img src="/images/logo.svg" alt="Kindlink" className="h-[40px] lg:h-14" />
            </div>

            {/* ── Mobile Titles ── */}
            <div className="lg:hidden absolute top-[10vh] sm:top-[12vh] left-1/2 -translate-x-1/2 w-full px-4 z-20">
                <h1 className="text-center text-[#1a1a2e] text-[26px] sm:text-[28px] font-extrabold mb-1 tracking-tight">
                    Welcome Kindlink!
                </h1>
                <h2 className="text-center text-[#1a1a2e] text-[20px] sm:text-[22px] font-extrabold tracking-[3px] uppercase">
                    LOGIN
                </h2>
            </div>

            {/* ── Illustration: desktop only ── */}
            <img
                src="/images/background/img.svg"
                alt="Kindlink Community"
                className="hidden lg:block absolute left-[6.5%] top-1/2 -translate-y-1/2 w-[37vw] max-h-[72vh] object-contain drop-shadow-xl select-none pointer-events-none z-[1]"
                draggable={false}
            />

            {/* ── Mobile Google Login ── */}
            <div className="lg:hidden absolute bottom-[5vh] left-1/2 -translate-x-1/2 w-full max-w-[340px] px-2 z-20">
                <div className="[&_.btn-google]:!bg-white [&_.btn-google]:!border [&_.btn-google]:!border-gray-300 [&_.btn-google]:!rounded-full [&_.btn-google]:!transition-all [&_.btn-google]:!duration-300 [&_.btn-google]:hover:-translate-y-[2px] [&_.btn-google]:hover:!shadow-[0_6px_20px_rgba(0,0,0,0.1)] [&_.btn-google]:hover:!border-gray-400 [&_.btn-google]:active:translate-y-0 [&_.btn-google]:active:!scale-[0.97] transform scale-[0.95] origin-[50%_0%]">
                    <GoogleLoginButton />
                </div>
            </div>

            {/* ── Form Section ── */}
            <div className="relative z-10 w-full flex items-center justify-center lg:justify-end lg:pr-[4%] xl:pr-[6%]
                mt-0 lg:mt-0">
                <div className="max-w-[340px] lg:max-w-[420px] xl:max-w-[440px] w-full px-4">
                    {/* Title */}
                    <div className="hidden lg:block">
                        <h1 className="text-center text-[#1a1a2e] lg:text-white text-[20px] sm:text-[24px] lg:text-[30px] font-extrabold mb-0.5 tracking-tight">
                            Welcome Kindlink!
                        </h1>
                        <h2 className="text-center text-[#1a1a2e] lg:text-white text-[15px] sm:text-[18px] lg:text-[22px] font-extrabold mb-3 lg:mb-5 tracking-[3px] uppercase">
                            LOGIN
                        </h2>
                    </div>

                    {/* Form Card */}
                    <div className="bg-transparent lg:bg-white/95 rounded-[20px] px-2 py-0 lg:px-6 lg:pt-5 lg:pb-4 lg:shadow-[0_6px_32px_rgba(0,0,0,0.08)] lg:backdrop-blur-sm">
                        <form onSubmit={onSubmit} noValidate>
                            {/* Error */}
                            {error && (
                                <div className="mb-3 lg:mb-4 p-3 lg:p-4 bg-red-50 border border-red-300 rounded-xl text-red-700 text-[13px] lg:text-[15px] font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div className="mb-4 lg:mb-3.5">
                                <label className="block text-[13px] lg:text-[13px] font-bold text-gray-800 mb-1.5 lg:mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setEmail(val);
                                        const err = validateEmail(val);
                                        setFieldErrors(prev => ({ ...prev, email: err || undefined }));
                                    }}
                                    placeholder="your@email.com"
                                    required
                                    autoComplete="email"
                                    className={`w-full px-3.5 py-[10px] lg:px-3.5 lg:py-[8px] bg-[#C1E8F4] border-2 rounded-lg outline-none text-[14px] lg:text-[14px] text-[#1a1a2e] transition-all duration-200 placeholder-[#7FBDD0]
                                        ${fieldErrors.email
                                            ? 'border-red-600 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                                            : 'border-transparent focus:border-[#48C9E9] focus:ring-[3px] focus:ring-[#48C9E9]/25 focus:bg-[#D4F1FA]'}`}
                                />
                                <p className={`text-red-600 text-[12px] lg:text-[11px] mt-0.5 ml-0.5 font-semibold leading-tight h-[13px] ${fieldErrors.email ? 'visible' : 'invisible'}`}>{fieldErrors.email || '\u00A0'}</p>
                            </div>

                            {/* Password */}
                            <div className="mb-4 lg:mb-3">
                                <label className="block text-[13px] lg:text-[13px] font-bold text-gray-800 mb-1.5 lg:mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPassword(val);
                                            if (!val) {
                                                setFieldErrors(prev => ({ ...prev, password: "Password is required" }));
                                            } else {
                                                setFieldErrors(prev => {
                                                    const next = { ...prev };
                                                    delete next.password;
                                                    return next;
                                                });
                                            }
                                        }}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        className={`w-full pr-11 pl-3.5 py-[10px] lg:pl-3.5 lg:py-[8px] bg-[#C1E8F4] border-2 rounded-lg outline-none text-[14px] lg:text-[14px] text-[#1a1a2e] transition-all duration-200 placeholder-[#7FBDD0]
                                            ${fieldErrors.password
                                                ? 'border-red-600 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                                                : 'border-transparent focus:border-[#48C9E9] focus:ring-[3px] focus:ring-[#48C9E9]/25 focus:bg-[#D4F1FA]'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7FBDD0] hover:text-[#48C9E9] transition-colors focus:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
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
                                <p className={`text-red-600 text-[12px] lg:text-[11px] mt-0.5 ml-0.5 font-semibold leading-tight h-[13px] ${fieldErrors.password ? 'visible' : 'invisible'}`}>{fieldErrors.password || '\u00A0'}</p>
                            </div>

                            {/* Remember me & Forgot password */}
                            <div className="flex items-center justify-between mb-5 lg:mb-3">
                                <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 lg:w-[18px] lg:h-[18px] accent-[#48C9E9] cursor-pointer rounded-sm"
                                    />
                                    <span className="text-[13px] lg:text-[14px] text-gray-600 leading-tight">Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-[13px] lg:text-[14px] font-bold text-gray-700 hover:text-[#48C9E9] transition-colors leading-tight"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <div className="text-center mb-4 lg:mb-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#99EBFF] text-[#1a1a2e] font-extrabold text-[15px] lg:text-[14px] px-12 lg:px-16 py-[12px] lg:py-[9px] rounded-[30px] border border-[#BEDDE8] transition-all duration-300 ease-out tracking-[2px] lg:tracking-[2px] uppercase hover:not-disabled:bg-gradient-to-r hover:not-disabled:from-[#A8E0F0] hover:not-disabled:to-[#7DD3E8] hover:not-disabled:border-[#7DD3E8] hover:not-disabled:-translate-y-[3px] hover:not-disabled:shadow-[0_8px_25px_rgba(72,201,233,0.35)] hover:not-disabled:scale-[1] active:not-disabled:translate-y-0 active:not-disabled:scale-[0.97] active:not-disabled:shadow-[0_2px_8px_rgba(72,201,233,0.25)] disabled:opacity-55 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Logging in...
                                        </>
                                    ) : "LOGIN"}
                                </button>
                            </div>

                            {/* Register link */}
                            <p className="text-center text-[13px] lg:text-[14px] text-gray-600">
                                Don&apos;t have an account?{" "}
                                <Link href="/register" className="font-bold text-gray-800 hover:text-[#48C9E9] transition-colors">
                                    Register
                                </Link>
                            </p>
                        </form>
                    </div>

                    {/* Google Login (Desktop) */}
                    <div className="hidden lg:block">
                        <div className="flex items-center gap-4 my-2 lg:my-4 before:content-[''] before:flex-1 before:h-px before:bg-[#48C9E9]/30 lg:before:bg-white/35 after:content-[''] after:flex-1 after:h-px after:bg-[#48C9E9]/30 lg:after:bg-white/35">
                            <span className="text-[12px] lg:text-[13px] text-gray-500 lg:text-white/70 font-medium">or</span>
                        </div>
                        <div className="[&_.btn-google]:!bg-white [&_.btn-google]:!border [&_.btn-google]:!border-gray-300 [&_.btn-google]:!rounded-full [&_.btn-google]:!transition-all [&_.btn-google]:!duration-300 [&_.btn-google]:hover:-translate-y-[3px] [&_.btn-google]:hover:!shadow-[0_8px_25px_rgba(0,0,0,0.12)] [&_.btn-google]:hover:!border-gray-400 [&_.btn-google]:active:translate-y-0 [&_.btn-google]:active:!scale-[0.97] transform scale-[0.85] lg:scale-[0.95] origin-top mb-4 lg:mb-0">
                            <GoogleLoginButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
