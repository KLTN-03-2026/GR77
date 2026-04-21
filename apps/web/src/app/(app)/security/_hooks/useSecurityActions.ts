'use client';

import { useState, useRef, useEffect } from 'react';
import { useGlobalAuth } from '@/contexts/AuthContext';

export function useSecurityActions() {
  const [resetStep, setResetStep] = useState<'idle' | 'email' | 'otp' | 'newpass' | 'success'>('idle');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifiedCode, setVerifiedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { user } = useGlobalAuth();

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSendCode = async () => {
    if (!email) { setError('Please enter your email.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/send-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset code.');
      }
      setResetStep('otp');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (codeOverride?: string) => {
    const code = codeOverride || otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid or expired code.');
      }
      setVerifiedCode(code);
      setResetStep('newpass');
    } catch (err: any) {
      const errorMsg = err.message || 'Verification failed.';
      setError(errorMsg);
      setIsLoading(false);
      setTimeout(() => {
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        setError((prev) => prev === errorMsg ? '' : prev);
      }, 1000);
      return;
    }
    setIsLoading(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verifiedCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password.');
      }
      setResetStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/send-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend code.');
      }
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setResetStep('idle');
    setOtp(['', '', '', '', '', '']);
    setVerifiedCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
  };

  const stepNumber = resetStep === 'email' ? 1 : resetStep === 'otp' ? 2 : resetStep === 'newpass' ? 3 : 0;

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  return {
    resetStep, setResetStep,
    email, setEmail,
    otp, setOtp,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    isLoading, error, setError,
    resendTimer,
    showNewPass, setShowNewPass,
    showConfirmPass, setShowConfirmPass,
    otpInputRefs,
    handleSendCode,
    handleVerifyOtp,
    handleResetPassword,
    handleResend,
    resetAll,
    stepNumber,
    strength: { hasMinLength, hasUppercase, hasNumber, hasSpecial }
  };
}
