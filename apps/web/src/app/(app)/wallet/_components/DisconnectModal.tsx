'use client';

import { LogOut } from "lucide-react";

interface DisconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DisconnectModal({ isOpen, onClose, onConfirm }: DisconnectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 animate-[scaleIn_0.2s_ease]">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6 mx-auto">
          <LogOut className="w-8 h-8 text-red-600" />
        </div>

        <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Disconnect Wallet?</h3>
        <p className="text-gray-500 text-center mb-8">
          Are you sure you want to disconnect your MetaMask wallet from your Kindlink account?
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full font-bold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-full font-bold text-[#BC4639] border border-[#BC4639] bg-white hover:bg-[#BC4639]/5 transition-all text-sm active:scale-95"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
