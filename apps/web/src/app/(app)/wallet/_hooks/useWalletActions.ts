'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export function useWalletActions() {
  const [account, setAccount] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>('0.0000');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChainLoading, setIsChainLoading] = useState(false);
  const [network, setNetwork] = useState<string>('Unknown');
  const [isCopied, setIsCopied] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const TARGET_NETWORK_ID = '0x89'; // Polygon Mainnet

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Auto-hide toast after 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`${API}/wallet/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.warn('Failed to fetch transactions');
    }
  }, [API]);

  const updateBalance = async (address: string) => {
    const ethereum = (window as any).ethereum;
    if (!address || !ethereum) return;
    try {
      const chainIdHex = await ethereum.request({ method: 'eth_chainId' });
      
      // Only Polygon Mainnet and Amoy
      if (chainIdHex.toLowerCase() !== TARGET_NETWORK_ID.toLowerCase() && chainIdHex.toLowerCase() !== '0x13882') {
        setEthBalance('0.0000');
        return;
      }

      const balanceHex = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      if (balanceHex) {
        const balanceBigInt = BigInt(balanceHex);
        const decimals = 18;
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
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902 && chainIdHex === '0x13882') {
        try {
          await ethereum.request({
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
          setToast({ type: 'error', message: 'Could not add Amoy network to wallet.' });
        }
      } else {
        setToast({ type: 'error', message: 'Network switch rejected.' });
      }
    }
  };

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      setIsChainLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setToast({ type: 'error', message: 'Please login first!' });
          return;
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const addr = accounts[0];

          // 1. Get Nonce
          const nonceRes = await fetch(`${API}/wallet/nonce`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!nonceRes.ok) {
            const errData = await nonceRes.json().catch(() => ({}));
            throw new Error(errData.message || `Server error: ${nonceRes.status}`);
          }

          const data = await nonceRes.json();
          const nonce = data.nonce;
          if (!nonce) throw new Error('Did not receive nonce');

          // 2. Sign Nonce
          const hexMessage = '0x' + Array.from(new TextEncoder().encode(nonce))
            .map(b => b.toString(16).padStart(2, '0')).join('');

          const signature = await ethereum.request({
            method: 'personal_sign',
            params: [hexMessage, addr],
          });

          // 3. Link Wallet
          const linkRes = await fetch(`${API}/wallet/link`, {
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
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            setNetwork(getNetworkName(chainId));
            setToast({ type: 'success', message: 'Wallet linked successfully!' });
          } else {
            const errData = await linkRes.json().catch(() => ({ message: 'Unknown error' }));
            setToast({ type: 'error', message: `Error: ${errData.message}` });
          }
        }
      } catch (err: any) {
        console.error('Wallet connection error:', err);
        const errMsg = err?.message || 'Error connecting to wallet';
        if (err?.code === 4001) {
          setToast({ type: 'error', message: 'Verification signature rejected.' });
        } else {
          setToast({ type: 'error', message: errMsg });
        }
      } finally {
        setIsChainLoading(false);
      }
    } else {
      setToast({ type: 'error', message: 'Please install MetaMask!' });
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setEthBalance('0.0000');
    setNetwork('Unknown');
    localStorage.setItem('wallet_disconnected', 'true');
    setShowDisconnectModal(false);
    setToast({ type: 'success', message: 'Wallet disconnected successfully!' });
  };

  const handleCopyAccount = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    const init = async () => {
      setIsLoading(true);
      await fetchTransactions();

      const isManualDisconnected = localStorage.getItem('wallet_disconnected') === 'true';

      if (ethereum && !isManualDisconnected) {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const addr = accounts[0];
          setAccount(addr);
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          setNetwork(getNetworkName(chainId));
          await updateBalance(addr);
        }
      }
      setIsLoading(false);
    };
    init();

    if (ethereum) {
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

      ethereum.on('accountsChanged', handleAccounts);
      ethereum.on('chainChanged', handleChain);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccounts);
        ethereum.removeListener('chainChanged', handleChain);
      };
    }
  }, [fetchTransactions, account]);

  return {
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
  };
}
