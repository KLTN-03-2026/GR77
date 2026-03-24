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

export default function WalletPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('0.0000');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChainLoading, setIsChainLoading] = useState(false);
  const [network, setNetwork] = useState<string>('Unknown');
  const [isCopied, setIsCopied] = useState(false);

  const TARGET_NETWORK_ID = '0x89'; // Polygon Mainnet
  const TARGET_NETWORK_NAME = 'Polygon Mainnet';
  const CURRENCY_SYMBOL = 'MATIC';

  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/wallet/transactions', {
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

      // Nếu sai mạng, hiển thị 0.0000 để cảnh báo
      if (chainIdHex !== TARGET_NETWORK_ID) {
        setEthBalance('0.0000');
        return;
      }

      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

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

        setEthBalance(`${whole || '0'}.${fraction || '0000'}`);
      }
    } catch (err) {
      console.warn('Balance update failed');
    }
  };

  const getNetworkName = (chainIdHex: string) => {
    if (chainIdHex === '0x89') return 'Polygon Mainnet';
    if (chainIdHex === '0x13882') return 'Polygon Amoy';
    if (chainIdHex === '0x1') return 'Ethereum Mainnet';
    if (chainIdHex === '0xaa36a7') return 'Sepolia Testnet';
    return 'Network: ' + chainIdHex;
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsChainLoading(true);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const addr = accounts[0];
          setAccount(addr);
          localStorage.setItem('wallet_disconnected', 'false');
          await updateBalance(addr);
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setNetwork(getNetworkName(chainId));
        }
      } catch (err) {
        console.error('Wallet connection error');
      } finally {
        setIsChainLoading(false);
      }
    } else {
      alert('Vui lòng cài đặt MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setEthBalance('0.0000');
    setNetwork('Unknown');
    localStorage.setItem('wallet_disconnected', 'true');
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

      const handleChain = (chainId: string) => {
        setNetwork(getNetworkName(chainId));
        if (account) updateBalance(account);
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
      <div className="p-4 md:p-8 bg-white min-h-screen">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen text-gray-900 font-sans tracking-tight">
      <div className="max-w-5xl mx-auto">

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

        {/* --- WRONG NETWORK ALERT --- */}
        {account && network !== 'Polygon Mainnet' && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between text-orange-900 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <p>Hãy chuyển mạng sang Polygon Mainnet để xem số dư chính xác (Mạng hiện tại: {network})</p>
            </div>
          </div>
        )}

        {/* --- MAIN SECTION --- */}
        <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center md:text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số dư khả dụng</p>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-5xl font-extrabold text-gray-900 tracking-tighter">
                  {(account && network === 'Polygon Mainnet') ? ethBalance : '0.0000'}
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
                  onClick={disconnectWallet}
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
    </div>
  );
}
