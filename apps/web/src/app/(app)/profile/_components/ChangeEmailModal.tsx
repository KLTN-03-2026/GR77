import React from 'react';
import { XMarkIcon, ExclamationCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ChangeEmailModalProps {
  showEmailModal: boolean;
  onClose: () => void;
  emailStep: 'form' | 'otp';
  setEmailStep: (step: 'form' | 'otp') => void;
  emailError: string;
  newEmail: string;
  setNewEmail: (v: string) => void;
  emailPassword: string;
  setEmailPassword: (v: string) => void;
  otpCode: string;
  setOtpCode: (v: string) => void;
  emailLoading: boolean;
  handleRequestEmailChange: () => void;
  handleVerifyEmailChange: () => void;
}

export function ChangeEmailModal({
  showEmailModal,
  onClose,
  emailStep, setEmailStep,
  emailError,
  newEmail, setNewEmail,
  emailPassword, setEmailPassword,
  otpCode, setOtpCode,
  emailLoading,
  handleRequestEmailChange,
  handleVerifyEmailChange
}: ChangeEmailModalProps) {
  if (!showEmailModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[scaleIn_0.2s_ease]">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {emailStep === 'form' ? 'Change Email Address' : 'Verify New Email'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {emailError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl px-4 py-3 flex items-center gap-2">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
              {emailError}
            </div>
          )}

          {emailStep === 'form' ? (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newemail@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-medium transition-all outline-none"
                />
              </div>
              <button
                onClick={handleRequestEmailChange}
                disabled={emailLoading || !newEmail || !emailPassword}
                className="w-full py-3 rounded-full font-bold text-cyan-600 border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {emailLoading ? (
                  <div className="w-5 h-5 border-2 border-cyan-600/30 border-t-cyan-600 rounded-full animate-spin" />
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                A 6-digit verification code has been sent to <strong className="text-gray-800">{newEmail}</strong>.
                Please enter it below.
              </p>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-gray-800 font-bold text-center text-2xl tracking-[0.5em] transition-all outline-none"
                />
              </div>
              <button
                onClick={handleVerifyEmailChange}
                disabled={emailLoading || otpCode.length !== 6}
                className="w-full py-3 rounded-full font-bold text-cyan-600 border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {emailLoading ? (
                  <div className="w-5 h-5 border-2 border-cyan-600/30 border-t-cyan-600 rounded-full animate-spin" />
                ) : (
                  'Confirm Email Change'
                )}
              </button>
              <button
                onClick={() => setEmailStep('form')}
                className="w-full py-3 rounded-full font-bold text-[#BC4639] border border-[#BC4639] bg-white hover:bg-[#BC4639]/5 transition-all text-sm flex items-center justify-center gap-2 active:scale-95 group"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
