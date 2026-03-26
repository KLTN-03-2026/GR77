"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { AdminLanguageProvider, useAdminLanguage } from "@/contexts/AdminLanguageContext";

function LanguageToggle() {
    const { language, setLanguage } = useAdminLanguage();
    return (
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50 flex items-center bg-slate-800/50 p-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
            <div className="pl-3 pr-2.5 text-slate-400">
                <GlobeAltIcon className="w-5 h-5" />
            </div>
            <div className="flex gap-1">
                <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                >
                    EN
                </button>
                <button
                    type="button"
                    onClick={() => setLanguage('vi')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'vi' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                >
                    VI
                </button>
            </div>
        </div>
    );
}

function AdminLoginForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { translate } = useAdminLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                // Ưu tiên dùng thông báo đã dịch cho lỗi login không thành công (401)
                if (res.status === 401) {
                    throw new Error(translate("login.err_invalid"));
                }

                let errorMsg = translate("login.err_general");
                try {
                    const data = await res.json();
                    errorMsg = data.message || errorMsg;
                } catch (e) { }
                throw new Error(errorMsg);
            }

            const data = await res.json();

            // Decode JWT payload để lấy role → check role for Admin
            let role: string | undefined;
            try {
                if (data.accessToken) {
                    const payload = JSON.parse(
                        atob(data.accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
                    );
                    role = payload?.role;
                }
            } catch {
                // ignore decode error
            }

            if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
                setError(translate("login.err_denied"));
                setIsLoading(false);
                return;
            }

            if (data.accessToken) {
                localStorage.setItem("adminAccessToken", data.accessToken);
            }
            if (data.refreshToken) {
                localStorage.setItem("adminRefreshToken", data.refreshToken);
            }

            // Lưu tên hiển thị (dùng phần trước @ của email)
            const displayName = email.split("@")[0];
            localStorage.setItem("adminUserName", displayName);

            router.push("/admin/dashboard");
        } catch (err: any) {
            setError(err.message || translate("login.err_general"));
            setIsLoading(false);
        }
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
          border-color: #64748b;
          box-shadow: 0 0 0 3px rgba(89, 131, 189, 0.25);
        }

        /* Button hover */
        .btn-create {
          transition: all 0.25s ease;
        }
        .btn-create:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        .btn-create:active {
          transform: translateY(0) scale(0.98);
        }

      `}</style>

            <div className="login-page relative min-h-screen flex items-center justify-center overflow-hidden">
                <LanguageToggle />
                {/* ===== TRANQUIL DARK SLATE GRADIENT BACKGROUND ===== */}
                <div
                    className="absolute inset-0 anim-gradient-bg"
                    style={{
                        background: "linear-gradient(135deg, #141c2fff 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #020617 100%)",
                    }}
                />

                {/* ===== FLOATING CIRCLES & DECORATIONS ===== */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Large circles */}
                    <div className="absolute top-[8%] left-[6%] w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/5 anim-float" />
                    <div className="absolute top-[20%] right-[8%] w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-white/5 anim-float-d" />
                    <div className="absolute bottom-[12%] left-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/5 anim-float" style={{ animationDelay: "1s" }} />
                    <div className="absolute bottom-[30%] right-[6%] w-12 h-12 sm:w-18 sm:h-18 rounded-full bg-white/5 anim-float-d" />
                    <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-36 h-36 sm:w-52 sm:h-52 rounded-full border border-white/5 anim-pulse-ring" />
                    <div className="absolute top-[57%] left-[50%] -translate-x-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-white/5 anim-pulse-ring" style={{ animationDelay: "1.5s" }} />

                    {/* Small dots */}
                    <div className="absolute top-[15%] left-[45%] w-2 h-2 rounded-full bg-white/10" />
                    <div className="absolute top-[40%] left-[18%] w-2 h-2 rounded-full bg-white/10" />
                    <div className="absolute bottom-[22%] right-[25%] w-2 h-2 rounded-full bg-white/10" />
                    <div className="absolute bottom-[40%] left-[55%] w-1.5 h-1.5 rounded-full bg-white/10" />
                    <div className="absolute top-[35%] right-[35%] w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>

                {/* ===== FORM CONTENT ===== */}
                <div className="relative z-10 w-full max-w-[440px] px-5 sm:px-6 py-12 sm:py-16">
                    {/* Badge */}
                    <div className="flex justify-center mb-4 anim-up-0">
                        <div className="px-5 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-white/25 bg-white/10 backdrop-blur-sm text-slate-300">
                            {translate("login.badge")}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white mb-10 sm:mb-14 anim-up-1 tracking-tight">
                        {translate("login.title")}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-sm anim-up-2">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="anim-up-2">
                            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-300 mb-2">
                                {translate("login.email_label")}
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@kindlink.com"
                                required
                                autoComplete="email"
                                className="field-input w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none text-[15px] placeholder-slate-400 shadow-sm"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-4 anim-up-3">
                            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-300 mb-2">
                                {translate("login.password_label")}
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
                                    className="field-input w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none pr-11 text-[15px] placeholder-slate-400 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
                    ${rememberMe ? "bg-slate-300 border-slate-300" : "border-slate-500 bg-slate-800 group-hover:border-slate-400"}`}
                                    >
                                        {rememberMe && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[13px] text-slate-300">{translate("login.remember_me")}</span>
                            </label>
                            <Link href="#" className="text-[13px] font-bold text-slate-300 hover:text-white transition-colors">
                                {translate("login.forgot_password")}
                            </Link>
                        </div>

                        {/* Create an Account Button */}
                        <div className="anim-up-4 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-create w-full py-3.5 bg-slate-700 text-white font-bold text-[15px] rounded-full shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-600 border border-slate-600"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {translate("login.btn_authenticating")}
                                    </span>
                                ) : (
                                    translate("login.btn_login")
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default function AdminLoginPage() {
    return (
        <AdminLanguageProvider>
            <AdminLoginForm />
        </AdminLanguageProvider>
    );
}
