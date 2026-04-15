'use client';

import {
  KeyIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useSecurityActions } from '../_hooks/useSecurityActions';

export function ChangePasswordForm() {
  const {
    resetStep, setResetStep,
    email,
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
    strength
  } = useSecurityActions();

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[520px]">
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
                  <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${stepNumber >= step
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-600 shadow-sm'
                    : 'border-transparent bg-gray-100 text-gray-400'
                    }`}>
                    {stepNumber > step ? '✓' : step}
                  </div>
                  <span className={`text-[10px] font-semibold ${stepNumber >= step ? 'text-cyan-600' : 'text-gray-300'}`}>
                    {step === 1 ? 'Email' : step === 2 ? 'Verify' : 'Password'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 rounded-full mb-5 transition-all duration-300 ${stepNumber > step ? 'bg-cyan-400' : 'bg-gray-200'
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
            <div className="mx-auto w-16 h-16 shrink-0 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <EnvelopeIcon className="w-8 h-8 text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset password via email</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">
              We'll send a 6-digit verification code to your registered email address for security.
            </p>
            <button
              onClick={() => setResetStep('email')}
              className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-cyan-600 border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 text-sm transition-all shadow-sm flex sm:inline-flex justify-center items-center gap-2 active:scale-95"
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
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-3">
              <button
                onClick={resetAll}
                className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-[#BC4639] border border-[#BC4639] bg-white hover:bg-[#BC4639]/5 text-sm transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95 group"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
              </button>
              <button
                onClick={handleSendCode}
                disabled={isLoading || !email}
                className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-cyan-600 border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 disabled:opacity-50 text-sm transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-cyan-600/30 border-t-cyan-600 rounded-full animate-spin" />
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

            <div className={`flex justify-center gap-1.5 sm:gap-2.5 ${error && resetStep === 'otp' ? 'shake' : ''}`}>
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
                  className={`w-10 sm:w-12 h-12 sm:h-14 shrink-0 text-center text-lg sm:text-xl font-bold rounded-xl border-2 transition-all outline-none ${digit
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

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-2">
              <button
                onClick={() => { setResetStep('email'); setOtp(['', '', '', '', '', '']); setError(''); }}
                className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-[#BC4639] border border-[#BC4639] bg-white hover:bg-[#BC4639]/5 text-sm transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95 group"
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
                    { label: '8+ characters', met: strength.hasMinLength },
                    { label: 'Uppercase letter', met: strength.hasUppercase },
                    { label: 'Number', met: strength.hasNumber },
                    { label: 'Special character', met: strength.hasSpecial },
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
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-3">
              <button
                onClick={() => { setResetStep('otp'); setError(''); }}
                className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-[#BC4639] border border-[#BC4639] bg-white hover:bg-[#BC4639]/5 text-sm transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95 group"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-cyan-600 border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 disabled:opacity-50 text-sm transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-cyan-600/30 border-t-cyan-600 rounded-full animate-spin" />
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
            <div className="mx-auto w-16 h-16 shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-green-700 mb-2">Password Updated!</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">Your password has been changed successfully. Use it next time you log in.</p>
            <button
              onClick={resetAll}
              className="w-full sm:w-auto px-10 py-3 rounded-full font-bold text-cyan-600 border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 text-sm transition-all shadow-sm flex sm:inline-flex justify-center items-center active:scale-95"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
