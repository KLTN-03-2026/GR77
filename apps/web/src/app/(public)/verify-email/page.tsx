"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const code = searchParams.get("code");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!email || !code) {
            setStatus("error");
            setMessage("Invalid verification link. Please check your email again.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/auth/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, code }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage("Your email has been successfully verified! You can now log in.");
                    // Auto redirect after 3 seconds
                    setTimeout(() => router.push("/login"), 3000);
                } else {
                    setStatus("error");
                    setMessage(data.message || "Verification failed. The code may be expired.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Something went wrong. Please try again later.");
            }
        };

        verify();
    }, [email, code, router]);

    return (
        <div className="relative z-10 w-full max-w-[440px] px-5 sm:px-6 py-12 sm:py-16">
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    {status === "loading" && (
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {status === "success" && (
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 transition-all duration-500 scale-110">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">
                    {status === "loading" ? "Verifying..." : status === "success" ? "Success!" : "Verification Failed"}
                </h1>

                <p className="text-white/90 mb-8 leading-relaxed font-medium">
                    {message}
                </p>

                {status !== "loading" && (
                    <Link
                        href="/login"
                        className="inline-block w-full py-3.5 bg-white text-[#00AEEF] font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-opacity-95 transition-all active:scale-95"
                    >
                        Go to Login
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                .verify-page * { 
                    font-family: 'Inter', -apple-system, sans-serif; 
                }

                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .anim-gradient-bg {
                    background-size: 200% 200%;
                    animation: gradientShift 8s ease infinite;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .anim-up {
                    animation: fadeInUp 0.6s ease-out both;
                }
            `}</style>

            <div className="verify-page relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Full-width gradient background */}
                <div
                    className="absolute inset-0 anim-gradient-bg"
                    style={{ background: "linear-gradient(135deg, #0097d9 0%, #00AEEF 25%, #33c1f5 50%, #00AEEF 75%, #007bb5 100%)" }}
                />

                {/* Decoratie circles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-[10%] right-[10%] w-40 h-40 rounded-full bg-white blur-3xl" />
                </div>

                <Suspense fallback={<div className="text-white font-bold">Verifying...</div>}>
                    <div className="anim-up">
                        <VerifyEmailContent />
                    </div>
                </Suspense>
            </div>
        </>
    );
}
