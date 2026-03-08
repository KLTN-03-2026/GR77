"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .login-page * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ===== ANIMATIONS ===== */
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
        .anim-up-6 { animation: fadeInUp 0.6s 0.48s ease-out both; }

        /* Input focus */
        .field-input {
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .field-input:focus {
          border-color: #00AEEF;
          box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.25);
        }

        /* Button hover */
        .btn-create {
          transition: all 0.25s ease;
        }
        .btn-create:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        .btn-create:active {
          transform: translateY(0) scale(0.98);
        }

        .btn-google {
          transition: all 0.25s ease;
        }
        .btn-google:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }
        .btn-google:active {
          transform: translateY(0) scale(0.98);
        }
      `}</style>

            <div className="login-page relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* ===== FULL-WIDTH BLUE GRADIENT BACKGROUND ===== */}
                <div
                    className="absolute inset-0 anim-gradient-bg"
                    style={{
                        background: "linear-gradient(135deg, #0097d9 0%, #00AEEF 25%, #33c1f5 50%, #00AEEF 75%, #007bb5 100%)",
                    }}
                />

                {/* ===== FLOATING CIRCLES & DECORATIONS ===== */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Large circles */}
                    <div className="absolute top-[8%] left-[6%] w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 anim-float" />
                    <div className="absolute top-[20%] right-[8%] w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-white/8 anim-float-d" />
                    <div className="absolute bottom-[12%] left-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/8 anim-float" style={{ animationDelay: "1s" }} />
                    <div className="absolute bottom-[30%] right-[6%] w-12 h-12 sm:w-18 sm:h-18 rounded-full bg-white/6 anim-float-d" />
                    <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-36 h-36 sm:w-52 sm:h-52 rounded-full border border-white/10 anim-pulse-ring" />
                    <div className="absolute top-[57%] left-[50%] -translate-x-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-white/5 anim-pulse-ring" style={{ animationDelay: "1.5s" }} />

                    {/* Small dots */}
                    <div className="absolute top-[15%] left-[45%] w-2 h-2 rounded-full bg-white/25" />
                    <div className="absolute top-[40%] left-[18%] w-2 h-2 rounded-full bg-white/20" />
                    <div className="absolute bottom-[22%] right-[25%] w-2 h-2 rounded-full bg-white/20" />
                    <div className="absolute bottom-[40%] left-[55%] w-1.5 h-1.5 rounded-full bg-white/25" />
                    <div className="absolute top-[35%] right-[35%] w-1.5 h-1.5 rounded-full bg-white/15" />
                </div>

                {/* ===== FORM CONTENT ===== */}
                <div className="relative z-10 w-full max-w-[440px] px-5 sm:px-6 py-12 sm:py-16">
                    {/* Badge */}
                    <div className="flex justify-center mb-4 anim-up-0">
                        <div className="px-5 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-white/25 bg-white/15 backdrop-blur-sm text-white">
                            Kindlink Login
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white mb-10 sm:mb-14 anim-up-1 tracking-tight">
                        Welcome Kindlink!
                    </h1>

                    {/* Email */}
                    <div className="mb-5 anim-up-2">
                        <label htmlFor="login-email" className="block text-sm font-semibold text-white mb-2">
                            Email Address
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                            className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none text-[15px] placeholder-gray-400 shadow-sm"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4 anim-up-3">
                        <label htmlFor="login-password" className="block text-sm font-semibold text-white mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none pr-11 text-[15px] placeholder-gray-400 shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    </div>

                    {/* Remember me & Forgot password */}
                    <div className="flex items-center justify-between mb-7 anim-up-3">
                        <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer group select-none">
                            <div className="relative">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all
                    ${rememberMe ? "bg-white border-white" : "border-white/40 bg-white/10 group-hover:border-white/60"}`}
                                >
                                    {rememberMe && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00AEEF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-[13px] text-white/70">Remember me</span>
                        </label>
                        <Link href="#" className="text-[13px] font-bold text-white hover:text-white/80 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Create an Account Button */}
                    <div className="anim-up-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="btn-create w-full py-3.5 bg-white text-[#00AEEF] font-bold text-[15px] rounded-full shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6 anim-up-5">
                        <div className="flex-1 h-px bg-white/30" />
                        <span className="text-sm text-white/70 font-medium">or</span>
                        <div className="flex-1 h-px bg-white/30" />
                    </div>

                    {/* Continue with Google */}
                    <div className="anim-up-6">
                        <button
                            type="button"
                            className="btn-google w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[15px] rounded-full flex items-center justify-center gap-3 shadow-sm"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
