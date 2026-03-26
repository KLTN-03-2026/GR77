import React from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface EmailSectionProps {
  email: string | undefined;
  onOpenModal: () => void;
}

export function EmailSection({ email, onOpenModal }: EmailSectionProps) {
  return (
    <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 p-8">
      <h3 className="text-xl font-bold text-[#1d2951] mb-2">Email Address</h3>
      <p className="text-sm text-gray-400 mb-6">
        Changing your email requires password verification and a confirmation code sent to the new email.
      </p>

      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 rounded-xl">
            <EnvelopeIcon className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{email}</p>
            <p className="text-xs text-gray-400">Primary email address</p>
          </div>
        </div>
        <button
          onClick={onOpenModal}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-colors"
        >
          Change Email
        </button>
      </div>
    </div>
  );
}
