'use client';

import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ChangePasswordForm } from './_components/ChangePasswordForm';
import { SecurityInfo } from './_components/SecurityInfo';

export default function SecurityPage() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-8 sm:pb-12">
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
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-500" />
          Account Security
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 ml-8 sm:ml-9">Manage your password and keep your account secure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Main content - Change Password Form */}
        <div className="lg:col-span-2">
          <ChangePasswordForm />
        </div>

        {/* Right sidebar - Tips & Requirements */}
        <div className="lg:col-span-1">
          <SecurityInfo />
        </div>
      </div>
    </div>
  );
}
