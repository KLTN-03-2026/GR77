'use client';

import { useState, useRef, useEffect } from 'react';
import {
  KeyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  FingerPrintIcon,
} from '@heroicons/react/24/outline';
import { useGlobalAuth } from '@/contexts/AuthContext';

export default function SecurityPage() {
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

  // Auto-fill email from logged-in user
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/auth/send-reset-code`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/auth/verify-reset-code`, {
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
      // Let the text shake and then auto-dismiss error after 1 second
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/auth/reset-password`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/auth/send-reset-code`, {
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
    // Re-fetch email (don't clear it)
  };

  const stepNumber = resetStep === 'email' ? 1 : resetStep === 'otp' ? 2 : resetStep === 'newpass' ? 3 : 0;

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const securityTips = [
    { icon: LockClosedIcon, title: 'Use a strong password', desc: 'Mix uppercase, lowercase, numbers and symbols' },
    { icon: EyeSlashIcon, title: 'Never share your password', desc: 'Keep it private and don\'t reuse across sites' },
    { icon: FingerPrintIcon, title: 'Use unique passwords', desc: 'Each account should have its own password' },
  ];

  return (
    <div className="w-full pb-12">
      <style dangerouslySetInnerHTML={{
        __html: `
        .shake { animation: shake 0.5s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear,
        input[type="password"]::-webkit-credentials-auto-fill-button {
          display: none !important;
        }
      `}} />
      {/* Header with gradient banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Account Security</h1>
            <p className="text-white/80 text-sm mt-0.5">Manage your password and keep your account secure.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Change Password */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: '520px' }}>
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 rounded-xl">
                <KeyIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-400">Receive a verification code via email to reset your password.</p>
              </div>
            </div>

            <div className="p-5 md:p-6 flex-1">
              {/* Steps indicator */}
              {resetStep !== 'idle' && resetStep !== 'success' && (
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center gap-1">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${stepNumber >= step
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-200/50'
                          : 'bg-gray-100 text-gray-400'
                          }`}>
                          {stepNumber > step ? '✓' : step}
                        </div>
                        <span className={`text-[10px] font-semibold ${stepNumber >= step ? 'text-cyan-600' : 'text-gray-300'}`}>
                          {step === 1 ? 'Email' : step === 2 ? 'Verify' : 'Password'}
                        </span>
                      </div>
                      {step < 3 && (
                        <div className={`w-12 h-0.5 rounded-full mb-5 transition-all duration-300 ${stepNumber > step ? 'bg-gradient-to-r from-cyan-400 to-blue-400' : 'bg-gray-200'
                          }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                  {error}
                </div>
              )}

              {/* Idle */}
              {resetStep === 'idle' && (
                <div className="text-center py-5">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                    <EnvelopeIcon className="w-8 h-8 text-cyan-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Reset password via email</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">
                    We'll send a 6-digit verification code to your registered email address for security.
                  </p>
                  <button
                    onClick={() => setResetStep('email')}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-200/50 inline-flex items-center gap-2 active:scale-[0.98]"
                  >
                    Change Password
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 1: Email */}
              {resetStep === 'email' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        readOnly
                        placeholder={email ? '' : 'Loading...'}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-medium transition-all outline-none text-sm cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-1">We'll send a verification code to this email</p>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <button
                      onClick={resetAll}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 group"
                    >
                      <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
                    </button>
                    <button
                      onClick={handleSendCode}
                      disabled={isLoading || !email}
                      className="px-7 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-200/50 flex items-center gap-2 active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Send Code <ArrowRightIcon className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: OTP */}
              {resetStep === 'otp' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full mb-4">
                      <EnvelopeIcon className="w-4 h-4 text-cyan-500" />
                      <span className="text-xs font-semibold text-cyan-700">Code sent</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Enter the code we sent to <span className="font-bold text-gray-900">{email}</span>
                    </p>
                  </div>

                  <div className={`flex justify-center gap-2.5 ${error && resetStep === 'otp' ? 'shake' : ''}`}>
                    {otp.map((digit: string, index: number) => (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={isLoading}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !/^\d$/.test(val)) return;
                          setOtp((prev) => {
                            const newOtp = [...prev];
                            newOtp[index] = val;
                            const fullCode = newOtp.join('');
                            if (fullCode.length === 6) {
                              setTimeout(() => handleVerifyOtp(fullCode), 0);
                            }
                            return newOtp;
                          });
                          setError('');
                          if (val && index < 5) {
                            setTimeout(() => otpInputRefs.current[index + 1]?.focus(), 0);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
                            setOtp((prev) => {
                              const newOtp = [...prev];
                              newOtp[index - 1] = '';
                              return newOtp;
                            });
                            otpInputRefs.current[index - 1]?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                          if (pasted) {
                            setOtp((prev) => {
                              const newOtp = [...prev];
                              for (let i = 0; i < pasted.length && index + i < 6; i++) {
                                newOtp[index + i] = pasted[i];
                              }
                              if (pasted.length === 6) {
                                setTimeout(() => handleVerifyOtp(newOtp.join('')), 0);
                              }
                              return newOtp;
                            });
                            const nextIdx = Math.min(index + pasted.length, 5);
                            setTimeout(() => otpInputRefs.current[nextIdx]?.focus(), 0);
                          }
                        }}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none ${digit
                          ? 'bg-cyan-50 border-cyan-300 text-gray-900'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                          } focus:bg-white focus:border-cyan-400 focus:ring-3 focus:ring-cyan-100`}
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-gray-400">
                        Resend code in <span className="font-bold text-cyan-500">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={isLoading}
                        className="text-xs font-bold text-cyan-500 hover:text-cyan-600 transition-colors underline underline-offset-2 disabled:opacity-50"
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>

                  {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-cyan-500">
                      <div className="w-4 h-4 border-2 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Verifying...</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => { setResetStep('email'); setOtp(['', '', '', '', '', '']); setError(''); }}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 group"
                    >
                      <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: New Password */}
              {resetStep === 'newpass' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                        placeholder="Enter new password (min 8 characters)"
                        autoComplete="new-password"
                        className="w-full px-4 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-cyan-400 focus:ring-3 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Password strength indicators */}
                    {newPassword && (
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        {[
                          { label: '8+ characters', met: hasMinLength },
                          { label: 'Uppercase letter', met: hasUppercase },
                          { label: 'Number', met: hasNumber },
                          { label: 'Special character', met: hasSpecial },
                        ].map((req, i) => (
                          <div key={i} className={`flex items-center gap-1.5 text-xs font-medium ${req.met ? 'text-green-500' : 'text-gray-300'}`}>
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            {req.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        className="w-full px-4 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-cyan-400 focus:ring-3 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords do not match.</p>
                    )}
                    {newPassword && newPassword.length >= 8 && confirmPassword === newPassword && (
                      <p className="text-xs text-green-500 mt-1.5 font-medium flex items-center gap-1">
                        <CheckCircleIcon className="w-3.5 h-3.5" /> Passwords match
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <button
                      onClick={() => { setResetStep('otp'); setError(''); }}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 group"
                    >
                      <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                      className="px-7 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-200/50 flex items-center gap-2 active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Success */}
              {resetStep === 'success' && (
                <div className="text-center py-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                    <CheckCircleIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-green-700 mb-2">Password Updated!</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">Your password has been changed successfully. Use it next time you log in.</p>
                  <button
                    onClick={resetAll}
                    className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors active:scale-[0.98]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Security Tips */}
          <div className="bg-[#98F4C1]/50 rounded-2xl shadow-sm border-none p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-gray-900" />
              Security Tips
            </h3>
            <div className="space-y-4">
              {securityTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="p-2 bg-white/60 rounded-lg flex-shrink-0 shadow-sm">
                    <tip.icon className="w-4 h-4 text-gray-800" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{tip.title}</p>
                    <p className="text-[11px] text-gray-700 mt-0.5 leading-relaxed font-medium">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <KeyIcon className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs font-bold text-amber-900">Password Requirements</p>
            </div>
            <ul className="text-[11px] text-amber-800 space-y-1.5 leading-relaxed">
              <li>• At least 8 characters long</li>
              <li>• Contains uppercase letter (A-Z)</li>
              <li>• Contains a number (0-9)</li>
              <li>• Contains a special character (!@#$...)</li>
              <li>• Cannot reuse your current password</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
