"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Island_Moments } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Logo from "@/components/common/logo";

const islandMoments = Island_Moments({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300);
  const [cooldown, setCooldown] = useState(0);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  
  const otpRef0 = useRef<HTMLInputElement>(null);
  const otpRef1 = useRef<HTMLInputElement>(null);
  const otpRef2 = useRef<HTMLInputElement>(null);
  const otpRef3 = useRef<HTMLInputElement>(null);
  const otpRef4 = useRef<HTMLInputElement>(null);
  const otpRef5 = useRef<HTMLInputElement>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];

  useEffect(() => {
    let interval: any;
    if (success && !verifySuccess && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [success, verifySuccess, timeLeft]);

  useEffect(() => {
    let interval: any;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);
    setVerifyError("");

    if (value && index < 5) {
      setTimeout(() => otpRefs[index + 1].current?.focus(), 0);
    }

    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 0) return;
    const newOtp = [...otpValues];
    for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
    }
    setOtpValues(newOtp);
    setVerifyError("");
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs[focusIndex].current?.focus();
    if (pastedData.length === 6) {
        handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setIsVerifying(true);
    setVerifyError("");
    try {
      const res = await fetch("http://localhost:3001/auth/verify-email", {
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
      otpRefs[0].current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (attemptsUsed >= 4) {
      alert("Maximum resend attempts reached.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setCooldown(60);
        setTimeLeft(300);
        setAttemptsUsed(prev => prev + 1);
        alert("A new verification code has been sent!");
      } else {
        alert(data.message || "Failed to resend email.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const partnerLogos = [
    { src: "/images/or1.jpg", name: "Partner 1" },
    { src: "/images/or2.jpg", name: "Partner 2" },
    { src: "/images/or3.jpg", name: "Partner 3" },
    { src: "/images/or4.jpg", name: "Partner 4" },
    { src: "/images/or5.jpg", name: "Partner 5" },
    { src: "/images/or6.jpg", name: "Partner 6" },
    { src: "/images/or7.jpg", name: "Partner 7" },
    { src: "/images/or8.jpg", name: "Partner 8" },
    { src: "/images/or9.jpg", name: "Partner 9" },
    { src: "/images/or10.jpg", name: "Partner 10" },
  ];

  const allPartnerLogos = [...partnerLogos, ...partnerLogos]; // Double for infinite scroll

  const kpiCards = [
    { title: "Active Donors", value: "120+" },
    { title: "Verified Transactions", value: "10M+" },
    { title: "Partner Organizations", value: "50+" },
    { title: "Lives Impacted", value: "8M+" },
    { title: "Faster Cross Border Transfers", value: "80%" },
    { title: "Global Accessibility", value: "24/7" },
  ];

  const bankLogos = [
    { name: "Vietcombank", src: "/images/bankicon/vcb.jpg" },
    { name: "BIDV", src: "/images/bankicon/bidv.jpg" },
    { name: "Vietinbank", src: "/images/bankicon/vtb.jpg" },
    { name: "Agribank", src: "/images/bankicon/agrib.jpg" },
    { name: "BIDC", src: "/images/bankicon/bidc.jpg" },
    { name: "ASB", src: "/images/bankicon/asb.jpg" },
    { name: "HDBank", src: "/images/bankicon/hdb.jpg" },
    { name: "Vingroup", src: "/images/bankicon/vingroup.jpg" },
    { name: "VNPay", src: "/images/bankicon/vnpay.jpg" },
  ];

  const allBankLogos = [...bankLogos, ...bankLogos]; // Double for infinite scroll

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-white">
      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { border-color: rgba(34, 211, 238, 0.5); box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
          50% { border-color: rgba(34, 211, 238, 1); box-shadow: 0 0 40px rgba(34, 211, 238, 0.6); }
        }
        @keyframes star-rotate {
          from { transform: rotate(0deg) scale(1.2); }
          to { transform: rotate(360deg) scale(1.5); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll-reverse {
          animation: scroll-reverse 40s linear infinite;
        }
        .animate-glow {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .group:hover .animate-star {
          animation: star-rotate 1.5s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.5s ease-in-out; }
        .otp-input { transition: all 0.2s ease; }
        .otp-input:focus {
          border-color: #fff;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
          transform: scale(1.08);
        }
      `}</style>
      {/* 1. Hero Section - Full width banner (no left spacing), rounded-bl corner */}
      <section className="relative w-full h-[450px] lg:h-[550px] flex items-center overflow-hidden bg-white">
        {/* Background Image Container - Removed border-l to eliminate left spacing */}
        <div className="absolute inset-0 rounded-bl-[80px] lg:rounded-bl-[150px] overflow-hidden border-b-[15px] border-white">
          <Image
            src="/images/banner-top.jpg"
            alt="Giving Heart Background"
            fill
            className="object-cover object-left lg:object-center"
            priority
          />
          {/* Subtle overlay for mobile readability */}
          <div className="absolute inset-0 bg-white/10 lg:bg-transparent" />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 w-full relative z-10">
          <div className="flex justify-end">
            <div className="w-full lg:w-1/2 flex flex-col space-y-3 lg:space-y-5 text-center lg:text-left bg-white/40 backdrop-blur-md lg:bg-transparent p-6 rounded-[30px] lg:p-0">
              <div className="flex justify-center lg:justify-start">
                <Logo height={58} />
              </div>
              <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] lg:text-xs font-semibold">Connecting your heart with transparency</p>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-[#111] leading-[1.1] italic">
                Give with trust, <br className="hidden lg:block" />
                <span className="text-gray-800">Share with heart</span>
              </h1>
              <p className="text-base lg:text-xl text-gray-600 font-medium italic border-l-4 border-blue-400 pl-4 inline-block mx-auto lg:mx-0 max-w-fit">
                Every donation clearly recorded
              </p>

              {/* Pagination Dots */}
              <div className="flex justify-center lg:justify-start gap-2 pt-4 lg:pt-6">
                <div className="w-2 h-2 rounded-full bg-blue-200" />
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="w-2 h-2 rounded-full bg-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Partner Logos Strip - Infinite Slider */}
      <section className="py-8 lg:py-12 bg-white overflow-hidden">
        <div className="flex w-fit animate-scroll">
          {allPartnerLogos.map((logo, idx) => (
            <div key={idx} className="relative h-10 w-28 lg:h-12 lg:w-36 mx-8 flex-shrink-0 cursor-pointer">
              <Image src={logo.src} alt={logo.name} fill className="object-contain" />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Quote Section */}
      <section className="py-12 lg:py-24 bg-zinc-50 border-y border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className={`${islandMoments.className} text-4xl lg:text-5xl text-gray-800 leading-tight max-w-4xl mx-auto px-6`}>
            "Our platform leverages blockchain technology to ensure transparency, trust, and accountability in every charitable contribution."
          </h2>
        </div>
      </section>

      {/* 4 & 5. World Map Section & Stats */}
      <section className="relative w-full py-12 lg:py-24 overflow-hidden bg-white">
        {/* Background Map */}
        <div className="absolute inset-0 flex items-center justify-center z-0 px-4">
          <Image
            src="/images/worldmap.svg"
            alt="World Map Background"
            width={1200}
            height={600}
            className="w-full max-w-[1240px] object-contain opacity-80"
          />
        </div>

        <div className="max-w-[1240px] mx-auto px-4 relative z-10">

          {/* Stats Overlay Content */}
          <div className="relative min-h-[400px] lg:min-h-[600px] flex flex-col justify-center gap-10 lg:gap-16 lg:pl-10 pb-20 lg:pb-0">
            {/* Stat 1 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <h3 className="text-4xl lg:text-5xl font-black text-[#001D4A]">99+</h3>
                <span className="text-xl lg:text-3xl font-extrabold text-[#001D4A]">Campaigns Launched</span>
              </div>
              <p className="text-lg lg:text-2xl italic font-bold text-gray-800 ml-16 mt-1">Building impact through blockchain</p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <h3 className="text-4xl lg:text-5xl font-black text-[#001D4A]">99+</h3>
                <span className="text-xl lg:text-3xl font-extrabold text-[#001D4A]">Global Communities</span>
              </div>
              <p className="text-lg lg:text-2xl italic font-bold text-gray-800 ml-16 mt-1">Connecting donors worldwide</p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <h3 className="text-4xl lg:text-5xl font-black text-[#001D4A]">$99M+</h3>
                <span className="text-xl lg:text-3xl font-extrabold text-[#001D4A]">Raised Securely</span>
              </div>
              <p className="text-lg lg:text-2xl italic font-bold text-gray-800 ml-16 mt-4">Transparent Decentralized Trusted</p>
            </div>

            {/* Button - Enhanced size and effects */}
            <div className="relative mt-8 lg:mt-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 right-0 lg:right-16 group flex justify-center lg:block">
              <button
                onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 lg:px-14 py-4 lg:py-6 bg-white border-2 border-cyan-400 text-gray-900 font-black italic text-lg lg:text-3xl rounded-full flex items-center gap-4 shadow-2xl hover:scale-110 active:scale-95 transition-all animate-glow group-hover:bg-cyan-50"
              >
                go to donate
                <span className="text-yellow-400 text-2xl lg:text-4xl transition-transform animate-star inline-block">★</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. KPI Cards - Redesigned for exact shapes and decorative circles */}
      <section className="relative py-12 lg:py-20 bg-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 relative">
          {/* Decorative Circles from Design */}
          <div className="absolute top-[30%] left-[28%] w-24 h-24 bg-[#6699DD] rounded-full z-0 hidden lg:block" />
          <div className="absolute bottom-[35%] right-[28%] w-20 h-20 bg-[#F0706A] rounded-full z-0 hidden lg:block" />
          <div className="absolute bottom-[20%] right-[38%] w-10 h-16 bg-[#77CC88] rounded-full z-0 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 lg:gap-x-12 relative z-10">
            {kpiCards.map((card, idx) => (
              <div
                key={idx}
                className={`bg-[#F9F1F1] p-8 lg:p-10 flex flex-col h-full lg:min-h-[320px] shadow-sm transition-all hover:-translate-y-2
                  ${idx === 0 ? "rounded-[30px] lg:rounded-none lg:rounded-tl-[100px]" : ""}
                  ${idx === 1 ? "rounded-[30px] lg:rounded-none" : ""}
                  ${idx === 2 ? "rounded-[30px] lg:rounded-none lg:rounded-tr-[100px]" : ""}
                  ${idx === 3 ? "rounded-[30px] lg:rounded-none lg:rounded-bl-[100px]" : ""}
                  ${idx === 4 ? "rounded-[30px] lg:rounded-none" : ""}
                  ${idx === 5 ? "rounded-[30px] lg:rounded-none lg:rounded-br-[100px]" : ""}
                `}
              >
                <h4 className="text-lg lg:text-xl font-black text-gray-900 mb-6 text-center lg:text-left leading-tight">
                  {card.title.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h4>
                <div className="text-4xl lg:text-6xl font-black text-[#F8E300] text-center lg:text-left mt-auto">
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Sign Up Section - Increased right gap, centered elements */}
      <section id="signup-form" className="relative py-12 lg:py-20 bg-white">
        <div className="w-full lg:w-[90%] mr-auto group">
          <div className="relative w-full lg:min-h-[550px] rounded-tr-[100px] rounded-br-[100px] lg:rounded-tr-[150px] lg:rounded-br-[150px] overflow-hidden shadow-2xl flex items-center transition-all duration-700 ease-out hover:scale-[1.01] hover:-translate-y-3 hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
            {/* Background */}
            <div className="absolute inset-0">
              <Image
                src="/images/background-login.jpg"
                alt="Background Form"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 mix-blend-multiply opacity-90" />
            </div>

            <div className="relative z-10 w-full p-8 lg:p-16 lg:pl-24 text-white">
              {success ? (
                <div className="space-y-8 max-w-2xl mx-auto flex flex-col items-center">
                  {verifySuccess ? (
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
                  ) : (
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
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
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
                          onClick={handleResendEmail}
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
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
                  {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-sm">
                      {error}
                    </div>
                  )}

                  {/* Row 2: Email */}
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

                  {/* Row 3: Password */}
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

                  {/* Row 4: Confirm Password */}
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

                  {/* Row 5: Checkbox & Button - Centered */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 pt-4">
                    <div className="lg:col-start-4 lg:col-span-9 space-y-8 flex flex-col items-center">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="terms-check" className="w-6 h-6 accent-green-500 rounded border-none cursor-pointer" defaultChecked />
                        <label htmlFor="terms-check" className="text-xs lg:text-sm cursor-pointer opacity-95">
                          I agree to the Terms of Service and Privacy Policy. <a href="/login" className="underline ml-2 hover:text-white/80 transition-colors">Login</a>
                        </label>
                      </div>

                      <div className="flex justify-center w-full">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-24 py-4 bg-white text-blue-900 font-bold text-xl rounded-full shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all border border-gray-100 italic active:scale-95 disabled:opacity-50"
                        >
                          {isLoading ? "Signing up..." : "Sign up"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Extra Footer Sections - Infinite Bank Slider */}
      <section className="bg-white">
        <div className="border-t border-gray-100 py-12 overflow-hidden">
          <div className="flex w-fit animate-scroll-reverse">
            {allBankLogos.map((bank, idx) => (
              <div key={idx} className="relative h-8 w-24 md:h-10 md:w-32 mx-10 flex-shrink-0">
                <Image src={bank.src} alt={bank.name} fill className="object-contain opacity-80" />
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-12 lg:py-16 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-24">
            <div className="space-y-6 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <Logo height={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Building Trust Through Blockchain</h3>
              <p className="text-gray-600 leading-relaxed text-xs lg:text-sm">
                Our platform leverages blockchain technology to ensure transparency, trust, and accountability in every charitable contribution, ensuring every donation is clearly recorded and impactful.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center lg:text-left">
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800">Contact Us</h4>
                <div className="text-xs lg:text-sm text-gray-600 space-y-2">
                  <p>123 Kindlink Street, Suite 100</p>
                  <p>contact@kindlink.com</p>
                  <p>+84 123 456 789</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800">Follow us</h4>
                <div className="flex justify-center lg:justify-start gap-4">
                  {["Twitter", "Facebook", "Discord", "Github"].map((social) => (
                    <a key={social} href="#" className="text-gray-400 hover:text-[#00AEEF] transition-colors">
                      <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-gray-200 flex items-center justify-center text-[10px] lg:text-xs">
                        {social[0]}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
