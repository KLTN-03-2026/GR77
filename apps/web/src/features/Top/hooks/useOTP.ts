import { useState, RefObject } from "react";
import { authService } from "../services/authService";

export const useOTP = (email: string) => {
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const handleVerifyOtp = async (code: string, refs: RefObject<HTMLInputElement | null>[]) => {
    setIsVerifying(true);
    setVerifyError("");
    try {
      await authService.verifyEmail({ email, code });
      setVerifySuccess(true);
    } catch (err: any) {
      setVerifyError(err.message || "Verification failed. Please try again.");
      setOtpValues(["", "", "", "", "", ""]);
      refs[0]?.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (index: number, value: string, refs: RefObject<HTMLInputElement | null>[]) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);
    setVerifyError("");

    if (value && index < 5) {
      setTimeout(() => refs[index + 1]?.current?.focus(), 0);
    }

    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      handleVerifyOtp(fullCode, refs);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, refs: RefObject<HTMLInputElement | null>[]) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      refs[index - 1]?.current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, refs: RefObject<HTMLInputElement | null>[]) => {
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
    refs[focusIndex]?.current?.focus();
    
    if (pastedData.length === 6) {
        handleVerifyOtp(pastedData, refs);
    }
  };

  return {
    otpValues,
    verifyError,
    isVerifying,
    verifySuccess,
    handleChange,
    handleKeyDown,
    handlePaste,
  };
};
