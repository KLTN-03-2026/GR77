"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/constants/endpoints";
import { validateEmail, validatePassword, AUTH_ERRORS_MAP } from "@/lib/validation/auth";
import { useCountdown, useCooldown } from "./hooks/useCountdown";
import RegisterForm from "./_components/RegisterForm";
import OtpVerification from "./_components/OtpVerification";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [attemptsUsed, setAttemptsUsed] = useState(0);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

    const { timeLeft, reset: resetTimer } = useCountdown(300, success);
    const { cooldown, startCooldown } = useCooldown();

    /* ─── Register Submit ─── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

        // FE Validation
        const emailErr = validateEmail(email);
        const passErr = validatePassword(password);
        let confirmErr = "";
        if (password !== confirmPassword) {
            confirmErr = "Passwords do not match.";
        }

        if (emailErr || passErr || confirmErr) {
            setFieldErrors({ email: emailErr, password: passErr, confirmPassword: confirmErr });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                let errorMsg = "Registration failed.";
                if (data.message && AUTH_ERRORS_MAP[data.message]) {
                    errorMsg = AUTH_ERRORS_MAP[data.message];
                } else {
                    errorMsg = data.message || errorMsg;
                }
                throw new Error(errorMsg);
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── Resend Verification ─── */
    const handleResendEmail = async () => {
        if (attemptsUsed >= 4) {
            alert("Maximum resend attempts reached.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                startCooldown(60);
                resetTimer(300);
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

    /* ─── Screen Switching ─── */
    if (success) {
        return (
            <OtpVerification
                email={email}
                timeLeft={timeLeft}
                cooldown={cooldown}
                attemptsUsed={attemptsUsed}
                isLoading={isLoading}
                onResend={handleResendEmail}
            />
        );
    }

    return (
        <RegisterForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            isLoading={isLoading}
            error={error}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            onSubmit={handleSubmit}
        />
    );
}
