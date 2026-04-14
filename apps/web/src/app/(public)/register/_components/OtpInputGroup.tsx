"use client";

import React, { useRef } from "react";

interface OtpInputGroupProps {
    otpValues: string[];
    setOtpValues: React.Dispatch<React.SetStateAction<string[]>>;
    onComplete: (code: string) => void;
    isVerifying: boolean;
    verifyError: string;
}

export default function OtpInputGroup({ otpValues, setOtpValues, onComplete, isVerifying, verifyError }: OtpInputGroupProps) {
    const otpRef0 = useRef<HTMLInputElement>(null);
    const otpRef1 = useRef<HTMLInputElement>(null);
    const otpRef2 = useRef<HTMLInputElement>(null);
    const otpRef3 = useRef<HTMLInputElement>(null);
    const otpRef4 = useRef<HTMLInputElement>(null);
    const otpRef5 = useRef<HTMLInputElement>(null);
    const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpValues];
        newOtp[index] = value.slice(-1);
        setOtpValues(newOtp);

        if (value && index < 5) {
            setTimeout(() => {
                otpRefs[index + 1].current?.focus();
            }, 0);
        }

        // Auto-submit when all 6 digits are filled
        const fullCode = newOtp.join("");
        if (fullCode.length === 6) {
            onComplete(fullCode);
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
        const focusIndex = Math.min(pastedData.length, 5);
        otpRefs[focusIndex].current?.focus();
        if (pastedData.length === 6) {
            onComplete(pastedData);
        }
    };


    return (
        <div className={`flex justify-center gap-3 mb-6 ${verifyError ? "shake" : ""}`}>
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
    );
}
