"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlobalAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Bookmark } from "lucide-react";

// Sub-components
import { CampaignHeader } from "@/components/campaign/CampaignHeader";
import { CampaignMeta } from "@/components/campaign/CampaignMeta";
import { CampaignGoalProgress } from "@/components/campaign/CampaignGoalProgress";
import { CampaignDiscussion } from "@/components/campaign/CampaignDiscussion";
import { DonateModal } from "@/components/campaign/DonateModal";
import { ReportModal } from "@/components/campaign/ReportModal";

function formatCurrency(amount: number | string) {
    return Number(amount).toLocaleString("vi-VN");
}

function formatDate(dateString?: string) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

declare global {
    interface Window {
        ethereum?: any;
    }
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function CampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { user: currentUser } = useGlobalAuth();

    /* ── API fetch ── */
    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
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
        }).catch(() => { });
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
        } catch (err) { }
    };

    useEffect(() => {
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
                .catch(() => { });

            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites/${id}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.favorited) setIsLiked(true);
                })
                .catch(() => { });
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
        } catch (err) { }
    };

    /* ── Handlers ── */
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
        if (!newComment.trim()) return;
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Vui lòng đăng nhập để bình luận");
            router.push("/login");
            return;
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
                    content: newComment,
                    parentId: replyingTo?.id || null,
                }),
            });

            if (res.ok) {
                setNewComment("");
                setReplyingTo(null);
                fetchComments();
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
        } catch (err) { }
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
        } catch (err) { }
    };

    const getAvatar = (user: any) => {
        return user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;
    };

    /* ── Render ── */
    const fundingGoal = Number(campaign?.fundingGoalAmount ?? 0);
    const totalRaised = Number(campaign?.currentRaisedAmount ?? 0);
    const raisedPercent = fundingGoal > 0 ? Math.min(Math.round((totalRaised / fundingGoal) * 100), 100) : 0;

    const images = campaign?.images?.length
        ? campaign.images.map((img: any) => img.url)
        : (campaign?.coverImageUrl ? [campaign.coverImageUrl] : []);

    return (
        <div className="w-full lg:-mt-8">
            {/* Navigation */}
            <div className="mb-0 flex items-center justify-between">
                <Link href="/list" className="inline-flex items-center gap-2 px-0 py-1.5 rounded-full text-gray-400 hover:text-blue-600 transition-all group font-semibold text-sm">
                    <div className="p-1.5 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Campaigns
                </Link>

                {!isLoading && !fetchError && campaign && (
                    <button
                        onClick={handleToggleLike}
                        className={`p-2 rounded-xl border transition-all ${isLiked ? "border-red-400 bg-red-50 text-red-500 shadow-sm" : "border-gray-50 text-gray-300 hover:border-red-200"}`}
                    >
                        <Bookmark className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                    <p className="text-gray-400 font-medium">Loading campaign...</p>
                </div>
            )}

            {fetchError && (
                <div className="text-center py-24">
                    <p className="text-red-500 font-bold">{fetchError}</p>
                </div>
            )}

            {!isLoading && !fetchError && campaign && (
                <div className="space-y-4">
                    {/* Title at top */}
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">{campaign.title}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Image Carousel */}
                        <div className="lg:col-span-7">
                            <CampaignHeader
                                title=""
                                status={campaign.status}
                                images={images}
                                isCreator={currentUser?.id === campaign?.creatorUserId}
                                isLiked={isLiked}
                                onToggleLike={handleToggleLike}
                            />
                        </div>

                        {/* Right: Campaign Meta Info */}
                        <div className="lg:col-span-5 bg-gray-50/50 rounded-[2.5rem] p-8 border border-gray-100/50">
                            <CampaignMeta campaign={campaign} formatDate={formatDate} />
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-[#47c9e5] rounded-full"></div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight italic">Mô tả chiến dịch</h2>
                        </div>
                        <div className={`text-gray-600 leading-relaxed text-lg font-medium transition-all duration-500 ${!isDescriptionExpanded ? "line-clamp-3" : ""}`}>
                            {campaign.description}
                        </div>
                        {campaign.description?.length > 280 && (
                            <button
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                className="mt-4 text-sm font-bold text-[#47c9e5] hover:text-cyan-600 transition-all flex items-center gap-1.5"
                            >
                                {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                                <div className={`w-4 h-4 transition-transform duration-300 ${isDescriptionExpanded ? "rotate-180" : ""}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                        )}
                    </div>

                    <hr className="border-gray-100 border-4 rounded-full" />

                    <CampaignGoalProgress
                        raisedPercent={raisedPercent}
                        fundingGoal={fundingGoal}
                        totalRaised={totalRaised}
                        isJoined={isJoined}
                        isCreator={currentUser?.id === campaign?.creatorUserId}
                        campaignId={campaign?.id}
                        setDonateOpen={setDonateOpen}
                        handleJoin={handleJoin}
                        formatCurrency={formatCurrency}
                    />

                    <CampaignDiscussion
                        comments={comments}
                        campaign={campaign}
                        currentUser={currentUser}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        isCommenting={isCommenting}
                        handleSubmitComment={handleSubmitComment}
                        handleDeleteComment={handleDeleteComment}
                        setReportingCommentId={setReportingCommentId}
                        setReportModalOpen={setReportModalOpen}
                        getAvatar={getAvatar}
                        formatDate={formatDate}
                    />
                </div>
            )}

            <DonateModal
                donateOpen={donateOpen}
                setDonateOpen={setDonateOpen}
                donateAmount={donateAmount}
                setDonateAmount={setDonateAmount}
                isDonating={isDonating}
                donated={donated}
                setDonated={setDonated}
                donationMethod={donationMethod}
                setDonationMethod={setDonationMethod}
                blockchainLoading={blockchainLoading}
                blockchainError={blockchainError}
                setBlockchainError={setBlockchainError}
                handleDonate={handleDonate}
                handleBlockchainDonate={handleBlockchainDonate}
                QUICK_AMOUNTS={QUICK_AMOUNTS}
            />

            <ReportModal
                reportModalOpen={reportModalOpen}
                setReportModalOpen={setReportModalOpen}
                reportReason={reportReason}
                setReportReason={setReportReason}
                handleReportComment={handleReportComment}
            />
        </div>
    );
}
