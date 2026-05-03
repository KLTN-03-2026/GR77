"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants/endpoints";
import { executeBlockchainDonate } from "@/lib/blockchain/donate";

export function useDonation(campaignId: string, minimumDonationAmount: number, isJoined: boolean = false) {
    const router = useRouter();
    const [donateOpen, setDonateOpen] = useState(false);
    const [donateAmount, setDonateAmount] = useState("");
    const [isDonating, setIsDonating] = useState(false);
    const [donated, setDonated] = useState(false);
    const [donationMethod, setDonationMethod] = useState<'PAYOS' | 'BLOCKCHAIN'>('PAYOS');
    const [blockchainLoading, setBlockchainLoading] = useState(false);
    const [blockchainError, setBlockchainError] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [showJoinInvitation, setShowJoinInvitation] = useState(false);

    const fetchCampaign = () => {
        // Refresh data in place without closing the modal immediately
        if (isJoined) {
            router.refresh();
        } else {
            setDonateOpen(false);
            setDonated(false);
            setShowJoinInvitation(true);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get("status");
        const code = urlParams.get("code");
        if (status === "CANCELLED") {
            setDonateOpen(true);
            setBlockchainError("Bạn có thể thử lại.");
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }

        if (status === "PAID" || code === "00") {
            setDonated(true);
            setDonateOpen(true);

            const orderCode = urlParams.get("orderCode");
            window.history.replaceState({}, '', window.location.pathname);

            if (orderCode) {
                fetch(`${API_BASE_URL}/donations/check-status/${orderCode}`)
                    .then(res => res.json())
                    .then(() => {
                        fetchCampaign();
                    })
                    .catch(() => {
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

    const handleBlockchainDonate = async (amountVnd: number) => {
        if (typeof window.ethereum === 'undefined') {
            setBlockchainError('Vui lòng cài đặt MetaMask!');
            return;
        }

        setBlockchainLoading(true);
        setBlockchainError(null);
        try {
            const token = localStorage.getItem("accessToken");
            await executeBlockchainDonate({ campaignId, amountVnd, message, token });

            setDonated(true);
            fetchCampaign();
            // Modal stays open until user clicks "Tuyệt vời"
        } catch (err: any) {
            let userFriendlyMessage = err.message;

            if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') {
                userFriendlyMessage = 'Giao dịch đã bị huỷ.';
            } else if (err?.code === 'INSUFFICIENT_FUNDS') {
                userFriendlyMessage = 'Số dư ví của bạn không đủ POL để thực hiện quyên góp và trả phí gas.';
            } else if (err?.code === 'CALL_EXCEPTION') {
                userFriendlyMessage = 'Giao dịch bị từ chối bởi Smart Contract. Có thể chiến dịch này chưa sẵn sàng trên Blockchain.';
            } else if (err.message?.includes('estimateGas') || err.message?.includes('revert')) {
                userFriendlyMessage = 'Lỗi ước tính Gas: Có thể số dư không đủ hoặc chiến dịch chưa được kích hoạt.';
            }

            setBlockchainError(userFriendlyMessage);
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
        message, setMessage,
        showJoinInvitation, setShowJoinInvitation
    };
}
