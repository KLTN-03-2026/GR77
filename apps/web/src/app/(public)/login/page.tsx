"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/constants/endpoints";
import { validateEmail, AUTH_ERRORS_MAP } from "@/lib/validation/auth";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useGlobalAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    // Pre-fill email if it was remembered
    useEffect(() => {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setFieldErrors({});

        const emailErr = validateEmail(email);
        const passErr = !password ? "Password is required" : "";

        if (emailErr || passErr) {
            setFieldErrors({ email: emailErr, password: passErr });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                let errorMsg = "Invalid email or password.";
                if (data.message && AUTH_ERRORS_MAP[data.message]) {
                    errorMsg = AUTH_ERRORS_MAP[data.message];
                } else {
                    errorMsg = data.message || errorMsg;
                }
                throw new Error(errorMsg);
            }

            const data = await res.json();

            // Handle Remember Me logic on success
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", email);
            } else {
                localStorage.removeItem("rememberedEmail");
            }

            // Use basic user info from login response first
            let userProfile = data.user || {};

            // Fetch real profile for extra details (avatar, etc.)
            try {
                const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${data.accessToken}` },
                });
                if (meRes.ok) {
                    const freshProfile = await meRes.json();
                    userProfile = { ...userProfile, ...freshProfile };
                }
            } catch (err) {
                console.error("Failed to fetch fresh profile:", err);
            }

            // Sync with global auth context
            login({
                ...userProfile,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            } as any);

            const role = (userProfile as any)?.role;
            if (role === "ADMIN") {
                setError("Please use the Admin Portal (/admin/login) to log in.");
                setIsLoading(false);
                return;
            }

            // Redirect back to the campaign page if the user came from a donate gate
            const returnUrl = sessionStorage.getItem('returnAfterLogin');
            if (returnUrl) {
                sessionStorage.removeItem('returnAfterLogin');
                router.push(returnUrl);
            } else {
                router.push("/home");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            error={error}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            onSubmit={handleSubmit}
        />
    );
}
