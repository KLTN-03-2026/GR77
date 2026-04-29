"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/constants/endpoints";

export function useDonation(campaignId: string, minimumDonationAmount: number) {
    const [donateOpen, setDonateOpen] = useState(false);
    const [donateAmount, setDonateAmount] = useState("");
    const [isDonating, setIsDonating] = useState(false);
    const [donated, setDonated] = useState(false);
    const [donationMethod, setDonationMethod] = useState<'PAYOS' | 'BLOCKCHAIN'>('PAYOS');
    const [blockchainLoading, setBlockchainLoading] = useState(false);
    const [blockchainError, setBlockchainError] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const fetchCampaign = () => {
        // Since we are in a hook, we don't have direct access to setCampaign
        // but we trigger a page reload or let the parent handle it.
        // For simplicity, we just reload if status sync is successful
        window.location.reload();
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get("status");
        const code = urlParams.get("code");
        if (status === "PAID" || code === "00") {
            setDonated(true);
            setDonateOpen(true);

            const orderCode = urlParams.get("orderCode");
            window.history.replaceState({}, '', window.location.pathname);

            if (orderCode) {
                // console.log(`[PayOS Sync] Triggering status check for order: ${orderCode}`);
                fetch(`${API_BASE_URL}/donations/check-status/${orderCode}`)
                    .then(res => res.json())
                    .then(data => {
                        // console.log("[PayOS Sync] Response from server:", data);
                        fetchCampaign();
                    })
                    .catch(err => {
                        // console.error("[PayOS Sync] Error during sync:", err);
                        fetchCampaign();
                    });
            } else {
                fetchCampaign();
            }
        }
    }, [campaignId]);

    const formatCurrency = (amount: number | string) => {
        return Number(amount).toLocaleString("vi-VN");
    };

    const handleBlockchainDonate = async (amountVnd: number, forceDemo = false) => {
        if (!forceDemo && typeof window.ethereum === 'undefined') {
            setBlockchainError('Please install MetaMask!');
            return;
        }

        setBlockchainLoading(true);
        setBlockchainError(null);
        try {
            let from = '0xDEMO_WALLET_ADDRESS';
            let txHash = '0xDEMO_TX_HASH_' + Date.now();

            if (!forceDemo) {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                from = accounts[0];

                const platformWallet = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS;
                if (!platformWallet) {
                    throw new Error('Hệ thống chưa cấu hình ví nhận tiền (Platform Wallet).');
                }

                // Tiền sẽ được gửi vào ví Escrow của hệ thống trước khi giải ngân
                // Tỷ giá giả định 1 MATIC = 20,000 VND
                const MATIC_PRICE_VND = 20000;
                const ethAmount = (amountVnd / MATIC_PRICE_VND).toFixed(8);
                const weiValue = '0x' + (BigInt(Math.floor(Number(ethAmount) * 1e18))).toString(16);

                txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from,
                        to: platformWallet,
                        value: weiValue
                    }],
                });
            }

            const token = localStorage.getItem("accessToken");
            await fetch(`${API_BASE_URL}/donations/blockchain`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ campaignId, amount: amountVnd, txHash, walletAddress: from, message }),
            });

            setDonated(true);
            setTimeout(() => {
                setDonateOpen(false);
                setDonated(false);
                window.location.reload();
            }, 3000);
        } catch (err: any) {
            setBlockchainError(err.message || 'Blockchain transaction error');
        } finally {
            setBlockchainLoading(false);
        }
    };

    const handleDonate = async () => {
        const amount = Number(donateAmount);
        const minimumDonation = Number(minimumDonationAmount ?? 0);

        if (!amount || amount < minimumDonation) {
            alert(`Minimum donation is ${formatCurrency(minimumDonation)} VND`);
            return;
        }

        if (donationMethod === 'BLOCKCHAIN') {
            handleBlockchainDonate(amount);
            return;
        }

        setIsDonating(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_BASE_URL}/donations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ campaignId, amount: amount, message }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to create donation");
            }

            const data = await res.json();
            if (data.checkoutUrl) window.location.href = data.checkoutUrl;
        } catch (err: any) {
            alert(err.message || "Connection error");
        } finally {
            setIsDonating(false);
        }
    };

    return {
        donateOpen, setDonateOpen,
        donateAmount, setDonateAmount,
        isDonating,
        donated, setDonated,
        donationMethod, setDonationMethod,
        blockchainLoading,
        blockchainError, setBlockchainError,
        handleDonate,
        handleBlockchainDonate,
        message, setMessage
    };
}
