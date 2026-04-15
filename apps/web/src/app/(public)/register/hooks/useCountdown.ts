"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook for managing countdown timers (OTP expiry + resend cooldown).
 */
export function useCountdown(initialTime: number, startImmediately: boolean) {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (!startImmediately || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [startImmediately, timeLeft]);

    const reset = (newTime?: number) => setTimeLeft(newTime ?? initialTime);
    return { timeLeft, reset };
}

export function useCooldown() {
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const interval = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldown]);

    const startCooldown = (seconds: number) => setCooldown(seconds);
    return { cooldown, startCooldown };
}
