'use client';

import { 
  Wallet, 
  Copy, 
  RefreshCw, 
  LogOut 
} from "lucide-react";

interface WalletCardProps {
  account: string | null;
  ethBalance: string;
  isChainLoading: boolean;
  isCopied: boolean;
  handleCopyAccount: () => void;
  connectWallet: () => void;
  setShowDisconnectModal: (show: boolean) => void;
}

export function WalletCard({
  account,
  ethBalance,
  isChainLoading,
  isCopied,
  handleCopyAccount,
  connectWallet,
  setShowDisconnectModal
}: WalletCardProps) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-8 md:p-12 shadow-sm mb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="space-y-4 text-center md:text-left">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Balance</p>
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="text-5xl font-extrabold text-gray-900 tracking-tighter">
              {account ? ethBalance : '0.0000'}
            </span>
            <span className="text-xl font-bold text-gray-300 uppercase">MATIC</span>
          </div>

          {account && (
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 font-medium">
              <span className="font-mono bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 text-gray-400">
                {account.slice(0, 10)}...{account.slice(-10)}
              </span>
              <button
                onClick={handleCopyAccount}
                className={`p-2 rounded-xl transition-all ${isCopied ? 'bg-green-500 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto">
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isChainLoading}
              className="w-full md:w-auto px-10 py-4 rounded-full font-bold text-cyan-600 border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
            >
              {isChainLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wallet className="w-6 h-6" />}
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={() => setShowDisconnectModal(true)}
              className="w-full md:w-auto px-8 py-3 rounded-full font-bold text-[#BC4639] border border-[#BC4639] bg-white hover:bg-[#BC4639]/5 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
