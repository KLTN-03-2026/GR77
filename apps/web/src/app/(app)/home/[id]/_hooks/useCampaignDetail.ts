"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useCampaignDetail(id: string, currentUser: any) {
    const router = useRouter();

    /* ── API fetch ── */
    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    const fetchCampaign = async () => {
        setIsLoading(true);
        setFetchError("");
        try {
            const token = localStorage.getItem('accessToken');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}`, {
                headers,
            });
            if (!res.ok) throw new Error("Campaign not found");
            const data = await res.json();
            setCampaign(data);
        } catch (err: any) {
            setFetchError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchCampaign();
    }, [id]);

    // Track view history
    useEffect(() => {
        if (!campaign) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/view-histories/${id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
    }, [campaign, id]);

    /* ── State ── */
    const [donateOpen, setDonateOpen] = useState(false);
    const [donateAmount, setDonateAmount] = useState("");
    const [isDonating, setIsDonating] = useState(false);
    const [donated, setDonated] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [donationMethod, setDonationMethod] = useState<'PAYOS' | 'BLOCKCHAIN'>('PAYOS');
    const [blockchainLoading, setBlockchainLoading] = useState(false);
    const [blockchainError, setBlockchainError] = useState<string | null>(null);

    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [isCommenting, setIsCommenting] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState("");

    const fetchComments = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/comments/campaign/${id}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {}
    };

    useEffect(() => {
        if (!id) return;
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("status") === "success") {
            setDonated(true);
            setDonateOpen(true);
        }

        const token = localStorage.getItem("accessToken");
        if (token) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/participants/${id}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.joined) setIsJoined(true);
                })
                .catch(() => {});

            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites/${id}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.favorited) setIsLiked(true);
                })
                .catch(() => {});
        }
        fetchComments();
    }, [id]);

    const handleToggleLike = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Vui lòng đăng nhập để thực hiện chức năng này");
            router.push("/login");
            return;
        }

        try {
            const method = isLiked ? "DELETE" : "POST";
            const url = isLiked ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites/${id}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites`;
            const body = isLiked ? undefined : JSON.stringify({ campaignId: id });

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body,
            });

            if (res.ok) {
                setIsLiked(!isLiked);
            }
        } catch (err) {}
    };

    const handleJoin = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Bạn cần đăng nhập để tham gia chiến dịch!");
            router.push("/login");
            return;
        }
        setIsJoining(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/participants`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ campaignId: id }),
            });
            if (res.ok) {
                setIsJoined(true);
                alert("Tham gia chiến dịch thành công!");
                router.push(`/joined/${id}`);
            } else {
                const data = await res.json();
                alert(data.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            alert("Lỗi kết nối");
        } finally {
            setIsJoining(false);
        }
    };

    const handleDonate = async () => {
        const amount = Number(donateAmount);
        const minimumDonation = Number(campaign?.minimumDonationAmount ?? 0);
        if (!amount || amount < minimumDonation) {
            alert(`Minimum donation is ${(minimumDonation).toLocaleString("vi-VN")} VND`);
            return;
        }

        if (donationMethod === 'BLOCKCHAIN') {
            handleBlockchainDonate(amount);
            return;
        }

        setIsDonating(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/donations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ campaignId: id, amount: amount }),
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

    const handleBlockchainDonate = async (amountVnd: number, forceDemo = false) => {
        if (!forceDemo && typeof window.ethereum === 'undefined') {
            setBlockchainError('Vui lòng cài đặt MetaMask!');
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
                const ethAmount = (amountVnd / 70000000).toFixed(8);
                const weiValue = '0x' + (BigInt(Math.floor(Number(ethAmount) * 1e18))).toString(16);

                txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{ from, to: '0x0000000000000000000000000000000000000000', value: weiValue }],
                });
            }

            const token = localStorage.getItem("accessToken");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/donations/blockchain`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ campaignId: id, amount: amountVnd, txHash, walletAddress: from }),
            });

            setDonated(true);
            setTimeout(() => {
                setDonateOpen(false);
                setDonated(false);
                window.location.reload();
            }, 3000);
        } catch (err: any) {
            setBlockchainError(err.message || 'Lỗi giao dịch Blockchain');
        } finally {
            setBlockchainLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || isCommenting) return;
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Vui lòng đăng nhập để bình luận");
            router.push("/login");
            return;
        }

        const parentId = replyingTo?.id ?? null;
        let commentText = newComment.trim();

        let finalContent = commentText;
        if (replyingTo) {
            const name = replyingTo.user?.profile?.firstName
                ? `${replyingTo.user.profile.firstName} ${replyingTo.user.profile.lastName ?? ""}`.trim()
                : replyingTo.user?.username;
            const tag = `@${name}`;
            
            // If user still has the tag at start, we replace it with @[Name] for backend
            if (commentText.startsWith(tag)) {
                const messageOnly = commentText.slice(tag.length).trim();
                finalContent = `@[${name}] ${messageOnly}`;
            } else {
                // They deleted the tag, but we ARE still replying to this parent, just no @ tag
                finalContent = commentText;
            }
        }

        setIsCommenting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    campaignId: id,
                    content: finalContent,
                    parentId,
                }),
            });

            if (res.ok) {
                setNewComment("");
                setReplyingTo(null);
                await fetchComments();
            } else {
                const data = await res.json();
                alert(data.message || "Không thể gửi bình luận");
            }
        } catch (err) {
            alert("Lỗi kết nối");
        } finally {
            setIsCommenting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) fetchComments();
        } catch (err) {}
    };

    const handleReportComment = async () => {
        if (!reportReason.trim()) return;
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/comments/${reportingCommentId}/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: reportReason }),
            });
            if (res.ok) {
                alert("Đã gửi báo cáo bình luận.");
                setReportModalOpen(false);
                setReportReason("");
            }
        } catch (err) {}
    };

    return {
        campaign,
        isLoading,
        fetchError,
        isLiked,
        handleToggleLike,
        
        isJoined,
        handleJoin,
        
        donateOpen,
        setDonateOpen,
        donateAmount,
        setDonateAmount,
        isDonating,
        donated,
        setDonated,
        donationMethod,
        setDonationMethod,
        blockchainLoading,
        blockchainError,
        setBlockchainError,
        handleDonate,
        handleBlockchainDonate,

        comments,
        newComment,
        setNewComment,
        replyingTo,
        setReplyingTo,
        isCommenting,
        handleSubmitComment,
        handleDeleteComment,

        reportModalOpen,
        setReportModalOpen,
        reportReason,
        setReportReason,
        setReportingCommentId,
        handleReportComment,
    };
}
