'use client';

import { 
  Wallet, 
  Globe 
} from "lucide-react";
import { useWalletActions } from './_hooks/useWalletActions';
import { WalletCard } from './_components/WalletCard';
import { TransactionTable } from './_components/TransactionTable';
import { DisconnectModal } from './_components/DisconnectModal';
import { WalletToast } from './_components/WalletToast';

export default function WalletPage() {
  const {
    account,
    ethBalance,
    transactions,
    isLoading,
    isChainLoading,
    network,
    isCopied,
    showDisconnectModal,
    setShowDisconnectModal,
    toast,
    setToast,
    switchNetwork,
    connectWallet,
    disconnectWallet,
    handleCopyAccount
  } = useWalletActions();

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="w-full flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans tracking-tight">
      <div className="w-full">

        {/* --- HEADER --- */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-cyan-500" />
            Wallet Manager
          </h1>
          <p className="text-sm text-gray-400 mt-1 ml-10">
            Manage your Web3 assets on the Polygon network
          </p>
        </div>

        {/* --- NETWORK ALERT --- */}
        {account && network !== 'Polygon Mainnet' && network !== 'Polygon Amoy' && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between text-orange-900 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 flex-shrink-0" />
              <p>Current Network: {network}. Please switch to Polygon to view your accurate balance.</p>
            </div>
            <button
              onClick={() => switchNetwork('0x13882')}
              className="px-5 py-2 rounded-full border border-orange-600 font-bold text-sm text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors shrink-0"
            >
              Switch to Amoy
            </button>
          </div>
        )}

        {account && (network === 'Polygon Mainnet' || network === 'Polygon Amoy') && (
          <div className="mb-8 p-4 bg-cyan-50 border border-cyan-100 rounded-2xl flex flex-col md:flex-row items-center justify-between text-cyan-900 text-sm font-bold gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 flex-shrink-0" />
              <p>You are on {network}. {network === 'Polygon Mainnet' ? 'Switch to Testnet to test features.' : 'Current balance is for testing purposes.'}</p>
            </div>
            <button
              onClick={() => switchNetwork(network === 'Polygon Mainnet' ? '0x13882' : '0x89')}
              className="px-5 py-2 rounded-full border border-cyan-600 font-bold text-sm text-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-colors shrink-0 shadow-sm"
            >
              Switch to {network === 'Polygon Mainnet' ? 'Amoy Testnet' : 'Polygon Mainnet'}
            </button>
          </div>
        )}

        {/* --- MAIN CARD --- */}
        <WalletCard 
          account={account}
          ethBalance={ethBalance}
          isChainLoading={isChainLoading}
          isCopied={isCopied}
          handleCopyAccount={handleCopyAccount}
          connectWallet={connectWallet}
          setShowDisconnectModal={setShowDisconnectModal}
        />

        {/* --- TRANSACTION HISTORY --- */}
        <TransactionTable transactions={transactions} account={account} />

      </div>

      {/* --- MODALS & TOASTS --- */}
      <DisconnectModal 
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={disconnectWallet}
      />

      <WalletToast toast={toast} onClose={() => setToast(null)} />

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
