import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface EmailSectionProps {
  email: string | undefined;
  onOpenModal: () => void;
}

export function EmailSection({ email, onOpenModal }: EmailSectionProps) {
  return (
    <div className="bg-white rounded-t-xl sm:rounded-t-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
      <h3 className="text-xl font-bold text-[#1d2951] mb-2">Email Address</h3>
      <p className="text-sm text-gray-400 mb-6">
        Changing your email requires password verification and a confirmation code sent to the new email.
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 gap-4">
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 bg-cyan-50 rounded-xl border-1 border-cyan-600">
            <EnvelopeIcon className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{email}</p>
            <p className="text-xs text-gray-400">Primary email address</p>
          </div>
        </div>
        <button
          onClick={onOpenModal}
          className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-cyan-600 font-bold text-sm text-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-colors shrink-0"
        >
          Change Email
        </button>
      </div>
    </div>
  );
}
