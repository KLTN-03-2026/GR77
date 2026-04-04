'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Wallet,
  LogOut,
  Copy,
  RefreshCw,
  Globe,
  ExternalLink
} from "lucide-react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function WalletPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('0.0000');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChainLoading, setIsChainLoading] = useState(false);
  const [network, setNetwork] = useState<string>('Unknown');
  const [isCopied, setIsCopied] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-hide toast after 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const TARGET_NETWORK_ID = '0x89'; // Polygon Mainnet
  const TARGET_NETWORK_NAME = 'Polygon Mainnet';
  const CURRENCY_SYMBOL = 'MATIC';

  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/wallet/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.warn('Failed to fetch transactions');
    }
  }, []);

  const updateBalance = async (address: string) => {
    if (!address || typeof window.ethereum === 'undefined') return;
    try {
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('[Wallet] chainIdHex:', chainIdHex);

      // Nếu sai mạng (chỉ cho phép Polygon Mainnet và Amoy), hiển thị 0.0000 để cảnh báo
      if (chainIdHex.toLowerCase() !== TARGET_NETWORK_ID.toLowerCase() && chainIdHex.toLowerCase() !== '0x13882') {
        console.log('[Wallet] Wrong network, defaulting to 0.0000');
        setEthBalance('0.0000');
        return;
      }

      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      console.log('[Wallet] balanceHex:', balanceHex);

      if (balanceHex) {
        const balanceBigInt = BigInt(balanceHex);
        const decimals = 18;

        // Chuyển đổi an toàn từ bignum sang string với 4 chữ số thập phân
        let balanceStr = balanceBigInt.toString();

        if (balanceStr.length <= decimals) {
          balanceStr = '0'.repeat(decimals - balanceStr.length + 1) + balanceStr;
        }

        const dotPosition = balanceStr.length - decimals;
        const whole = balanceStr.substring(0, dotPosition);
        const fraction = balanceStr.substring(dotPosition, dotPosition + 4);

        console.log('[Wallet] Parsed balance:', `${whole || '0'}.${fraction || '0000'}`);
        setEthBalance(`${whole || '0'}.${fraction || '0000'}`);
      }
    } catch (err) {
      console.warn('Balance update failed', err);
    }
  };

  const getNetworkName = (chainIdHex: string) => {
    if (chainIdHex === '0x89') return 'Polygon Mainnet';
    if (chainIdHex === '0x13882') return 'Polygon Amoy';
    if (chainIdHex === '0x1') return 'Ethereum Mainnet';
    if (chainIdHex === '0xaa36a7') return 'Sepolia Testnet';
    return 'Network: ' + chainIdHex;
  };

  const switchNetwork = async (chainIdHex: string) => {
    if (typeof window.ethereum === 'undefined') return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902 && chainIdHex === '0x13882') {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
        } catch (addError) {
          setToast({ type: 'error', message: 'Không thể thêm mạng Amoy vào ví.' });
        }
      } else {
        setToast({ type: 'error', message: 'Từ chối đổi mạng.' });
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsChainLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setToast({ type: 'error', message: 'Vui lòng đăng nhập!' });
          return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const addr = accounts[0];

          // 1. Get Nonce
          const nonceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/wallet/nonce`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!nonceRes.ok) {
            const errData = await nonceRes.json().catch(() => ({}));
            throw new Error(errData.message || `Lỗi server: ${nonceRes.status}`);
          }

          const data = await nonceRes.json();
          const nonce = data.nonce;
          if (!nonce) throw new Error('Không nhận được mã xác thực (nonce)');

          console.log('[Wallet] Nonce received:', JSON.stringify(nonce));
          console.log('[Wallet] Signing with address:', addr);

          // 2. Sign Nonce — convert to hex for reliable personal_sign encoding
          const hexMessage = '0x' + Array.from(new TextEncoder().encode(nonce))
            .map(b => b.toString(16).padStart(2, '0')).join('');

          console.log('[Wallet] Hex message:', hexMessage);

          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [hexMessage, addr],
          });

          console.log('[Wallet] Signature:', signature);

          // 3. Link Wallet in Backend
          const linkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/wallet/link`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ address: addr, signature })
          });

          if (linkRes.ok) {
            setAccount(addr);
            localStorage.setItem('wallet_disconnected', 'false');
            await updateBalance(addr);
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setNetwork(getNetworkName(chainId));
            setToast({ type: 'success', message: 'Liên kết ví thành công!' });
          } else {
            const errData = await linkRes.json().catch(() => ({ message: 'Lỗi không xác định' }));
            setToast({ type: 'error', message: `Lỗi: ${errData.message}` });
          }
        }
      } catch (err: any) {
        console.error('Wallet connection error:', err);
        const errMsg = err?.message || 'Có lỗi xảy ra khi kết nối ví';
        if (err?.code === 4001) {
          setToast({ type: 'error', message: 'Bạn đã từ chối ký tên xác thực.' });
        } else {
          setToast({ type: 'error', message: errMsg });
        }
      } finally {
        setIsChainLoading(false);
      }
    } else {
      setToast({ type: 'error', message: 'Vui lòng cài đặt MetaMask!' });
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setEthBalance('0.0000');
    setNetwork('Unknown');
    localStorage.setItem('wallet_disconnected', 'true');
    setShowDisconnectModal(false);
    setToast({ type: 'success', message: 'Đã ngắt kết nối ví thành công!' });
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchTransactions();

      const isManualDisconnected = localStorage.getItem('wallet_disconnected') === 'true';

      if (typeof window.ethereum !== 'undefined' && !isManualDisconnected) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const addr = accounts[0];
          setAccount(addr);
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setNetwork(getNetworkName(chainId));
          await updateBalance(addr);
        }
      }
      setIsLoading(false);
    };
    init();

    if (window.ethereum) {
      const handleAccounts = (accounts: string[]) => {
        const isManualDisconnected = localStorage.getItem('wallet_disconnected') === 'true';
        if (accounts.length > 0 && !isManualDisconnected) {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        } else {
          setAccount(null);
        }
      };

      const handleChain = async (chainId: string) => {
        setNetwork(getNetworkName(chainId));
        if (account) {
          await updateBalance(account);
        }
      };

      window.ethereum.on('accountsChanged', handleAccounts);
      window.ethereum.on('chainChanged', handleChain);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccounts);
        window.ethereum.removeListener('chainChanged', handleChain);
      };
    }
  }, [fetchTransactions]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="w-full flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans tracking-tight">
      <div className="w-full">

        {/* --- HEADER --- */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-500" />
            Wallet Manager
          </h1>
          <p className="text-sm text-gray-400 mt-1 ml-10">
            Quản lý tài sản Web3 trên nền tảng Polygon
          </p>
        </div>

        {/* --- WRONG NETWORK ALERT & NETWORK SWITCHER --- */}
        {account && network !== 'Polygon Mainnet' && network !== 'Polygon Amoy' && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between text-orange-900 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <p>Mạng hiện tại: {network}. Hãy chuyển mạng sang Polygon để xem số dư chính xác.</p>
            </div>
            <button
              onClick={() => switchNetwork('0x13882')}
              className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors border border-orange-200"
            >
              Đổi sang Amoy
            </button>
          </div>
        )}

        {account && (network === 'Polygon Mainnet' || network === 'Polygon Amoy') && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col md:flex-row items-center justify-between text-blue-900 text-sm font-bold gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <p>Bạn đang ở {network}. {network === 'Polygon Mainnet' ? 'Đổi sang Testnet để thử nghiệm tính năng.' : 'Số dư hiện tại là số dư thử nghiệm.'}</p>
            </div>
            <button
              onClick={() => switchNetwork(network === 'Polygon Mainnet' ? '0x13882' : '0x89')}
              className="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200 shadow-sm"
            >
              Chuyển sang {network === 'Polygon Mainnet' ? 'Amoy Testnet' : 'Polygon Mainnet'}
            </button>
          </div>
        )}

        {/* --- MAIN SECTION --- */}
        <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center md:text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số dư khả dụng</p>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-5xl font-extrabold text-gray-900 tracking-tighter">
                  {account ? ethBalance : '0.0000'}
                </span>
                <span className="text-xl font-bold text-gray-300 uppercase">{CURRENCY_SYMBOL}</span>
              </div>

              {account && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 font-medium">
                  <span className="font-mono bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 text-gray-400">
                    {account.slice(0, 10)}...{account.slice(-10)}
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(account); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}
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
                  className="w-full md:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isChainLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wallet className="w-6 h-6" />}
                  Kết nối Ví
                </button>
              ) : (
                <button
                  onClick={() => setShowDisconnectModal(true)}
                  className="w-full px-8 py-3.5 bg-white border border-red-100 text-red-500 hover:bg-red-50 font-bold rounded-full transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Ngắt kết nối
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Activity History</h2>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest leading-none">Kindlink Activity</span>
            </div>
            {account && (
              <button
                onClick={() => window.open(`https://amoy.polygonscan.com/address/${account}`, '_blank')}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-all flex items-center gap-1.5 underline underline-offset-4 decoration-blue-100 hover:decoration-blue-400"
              >
                <ExternalLink className="w-4 h-4" />
                PolygonScan
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Giao dịch</th>
                  <th className="px-8 py-5 text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length > 0 ? transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-7">
                      <p className="font-bold text-gray-800">{tx.description || 'Hoạt động Kindlink'}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase leading-none">{new Date(tx.createdAt).toLocaleDateString("vi-VN")}</p>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <p className="text-lg font-bold text-gray-900 leading-none">
                        {tx.type === 'DONATION' ? '-' : '+'}{Number(tx.amount).toLocaleString()} VNĐ
                      </p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={2} className="py-24 text-center text-gray-300 font-bold italic">Chưa có dữ liệu giao dịch nội bộ.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- DISCONNECT MODAL --- */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDisconnectModal(false)} />
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 animate-[scaleIn_0.2s_ease]">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6 mx-auto">
              <LogOut className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Ngắt kết nối ví?</h3>
            <p className="text-gray-500 text-center mb-8">
              Bạn có chắc chắn muốn ngắt kết nối ví MetaMask khỏi tài khoản Kindlink của mình không?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="flex-1 py-3.5 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={disconnectWallet}
                className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all"
              >
                Ngắt kết nối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOAST COMPONENT --- */}
      {toast && (
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
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Keyframe animations */}
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
