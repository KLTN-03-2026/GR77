import { useState } from "react";
import { authService } from "../services/authService";
import { validatePasswordsMatch } from "../utils/validation";
import { useTimer } from "./useTimer";

export const useAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const { timeLeft: cooldown, setTimeLeft: setCooldown } = useTimer(0, true);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const validationError = validatePasswordsMatch(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      await authService.register({ email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (attemptsUsed >= 4) {
      alert("Maximum resend attempts reached.");
      return false;
    }
    setIsLoading(true);
    try {
      await authService.resendVerification(email);
      setCooldown(60);
      setAttemptsUsed(prev => prev + 1);
      alert("A new verification code has been sent!");
      return true;
    } catch (err: any) {
      alert(err.message || "Failed to resend email.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isLoading, isLoadingResend: isLoading,
    error, success,
    handleRegister,
    handleResendEmail,
    cooldown, attemptsUsed
  };
};
