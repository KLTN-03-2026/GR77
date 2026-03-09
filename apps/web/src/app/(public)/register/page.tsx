"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:3001/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                let errorMsg = "Registration failed.";
                try {
                    const data = await res.json();
                    errorMsg = data.message || errorMsg;
                } catch (e) { }
                throw new Error(errorMsg);
            }

            setSuccess(true);
            // Optionally auto-login or redirect to login
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .register-page * {
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

        .btn-register {
          transition: all 0.25s ease;
        }
        .btn-register:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        .btn-register:active {
          transform: translateY(0) scale(0.98);
        }
      `}</style>

            <div className="register-page relative min-h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 anim-gradient-bg"
                    style={{
                        background: "linear-gradient(135deg, #0097d9 0%, #00AEEF 25%, #33c1f5 50%, #00AEEF 75%, #007bb5 100%)",
                    }}
                />

                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[8%] left-[6%] w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 anim-float" />
                    <div className="absolute bottom-[12%] left-[10%] w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/8 anim-float" style={{ animationDelay: "1s" }} />
                    <div className="absolute top-[60%] left-[50%] -translate-x-1/2 w-36 h-36 sm:w-52 sm:h-52 rounded-full border border-white/10 anim-pulse-ring" />
                </div>

                <div className="relative z-10 w-full max-w-[440px] px-5 sm:px-6 py-12 sm:py-16">
                    <div className="flex justify-center mb-4 anim-up-0">
                        <div className="px-5 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-white/25 bg-white/15 backdrop-blur-sm text-white">
                            Kindlink Register
                        </div>
                    </div>

                    <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white mb-10 sm:mb-14 anim-up-1 tracking-tight">
                        Create Account
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-sm anim-up-2">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-white text-sm anim-up-2">
                                Registration successful! Redirecting to login...
                            </div>
                        )}

                        <div className="anim-up-2">
                            <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none text-[15px] shadow-sm"
                            />
                        </div>

                        <div className="anim-up-3">
                            <label className="block text-sm font-semibold text-white mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none pr-11 text-[15px] shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="anim-up-3">
                            <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="field-input w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 outline-none text-[15px] shadow-sm"
                            />
                        </div>

                        <div className="anim-up-4 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-register w-full py-3.5 bg-white text-[#00AEEF] font-bold text-[15px] rounded-full shadow-lg disabled:opacity-60"
                            >
                                {isLoading ? "Creating Account..." : "Register"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center anim-up-5">
                        <p className="text-white/70 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-white font-bold hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
