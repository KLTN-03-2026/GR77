'use client';

import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WalletToastProps {
  toast: { type: 'success' | 'error'; message: string } | null;
  onClose: () => void;
}

export function WalletToast({ toast, onClose }: WalletToastProps) {
  if (!toast) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-[slideIn_0.3s_ease] ${toast.type === 'success'
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
      {toast.type === 'success' ? (
        <CheckCircleIcon className="w-5 h-5 text-green-500" />
      ) : (
        <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
      )}
      {toast.message}
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
