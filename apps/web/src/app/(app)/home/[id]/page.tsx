"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/constants/endpoints";
import { KINDLINK_CAMPAIGN_ABI, POL_PER_VND } from "@/lib/constants/blockchain";
import { executeBlockchainDonate } from "@/lib/blockchain/donate";

// Shared Components
import { CampaignDiscussion } from "@/components/campaign/CampaignDiscussion";

// Local Sub-components
import { CampaignHero } from "./_components/CampaignHero";
import { CampaignDescription } from "./_components/CampaignDescription";
import { CampaignOverviewBox } from "./_components/CampaignOverviewBox";
import { CampaignGalleryBox } from "./_components/CampaignGalleryBox";
import { CampaignSidebar } from "./_components/CampaignSidebar";
import { CampaignModals } from "./_components/CampaignModals";
import { CampaignTabs } from "../../joined/[id]/_components/CampaignTabs";
import { LeaveCampaignModal } from "../../joined/[id]/_components/LeaveCampaignModal";

// Hooks & Utils
import { useCampaignDetail } from "./_hooks/useCampaignDetail";
import { formatCurrency, formatDate } from "./_utils/formatters";

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

    const fetchCampaign = async () => {
        setIsLoading(true);
        setFetchError("");
        try {
            const token = localStorage.getItem('accessToken');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
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
        fetchCampaign();
    }, [id]);

    // Track view history
    useEffect(() => {
        if (!campaign) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch(`${API_BASE_URL}/view-histories/${id}`, {
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
    const [hasDonatedUser, setHasDonatedUser] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [donationMessage, setDonationMessage] = useState("");
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [isCommenting, setIsCommenting] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState("");

    const [campaignReportModalOpen, setCampaignReportModalOpen] = useState(false);
    const [campaignReportReason, setCampaignReportReason] = useState("");

    const fetchComments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/comments/campaign/${id}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) { }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get("status");
        const code = urlParams.get("code");

        if (status === "PAID" || code === "00") {
            setDonated(true);
            setDonateOpen(true);

            const orderCode = urlParams.get("orderCode");
            // Clean up URL
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

        const token = localStorage.getItem("accessToken");
        if (token) {
            fetch(`${API_BASE_URL}/participants/${id}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.joined) setIsJoined(true);
                    if (data.hasDonated) setHasDonatedUser(true);
                })
                .catch(() => { });

            fetch(`${API_BASE_URL}/favorites/${id}/status`, {
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
            const url = isLiked ? `${API_BASE_URL}/favorites/${id}` : `${API_BASE_URL}/favorites`;
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

    const handleLeave = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setIsLeaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/participants/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setIsJoined(false);
                alert("Bạn đã rời chiến dịch.");
            } else {
                const data = await res.json();
                alert(data.message || "Không thể rời chiến dịch");
            }
        } catch (err) {
            alert("Lỗi kết nối");
        } finally {
            setIsLeaving(false);
            setShowLeaveModal(false);
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
                body: JSON.stringify({
                    campaignId: id,
                    amount: amount,
                    message: donationMessage,
                }),
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

    const handleBlockchainDonate = async (amountVnd: number) => {
        if (typeof window.ethereum === 'undefined') {
            setBlockchainError('Vui lòng cài đặt MetaMask!');
            return;
        }
        setBlockchainLoading(true);
        setBlockchainError(null);
        try {
            const token = localStorage.getItem("accessToken");
            await executeBlockchainDonate({ campaignId: id, amountVnd, message: donationMessage, token });
            setDonated(true);
            setTimeout(() => {
                setDonateOpen(false);
                setDonated(false);
                window.location.reload();
            }, 3000);
        } catch (err: any) {
            if (err?.code === 4001 || err?.code === 'ACTION_REJECTED') {
                setBlockchainError('Giao dịch đã bị huỷ.');
            } else {
                setBlockchainError(err.message || 'Lỗi giao dịch Blockchain');
            }
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

    const handleReportCampaign = async () => {
        if (!campaignReportReason.trim()) return;
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Vui lòng đăng nhập để báo cáo chiến dịch");
            router.push("/login");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    reason: campaignReportReason
                }),
            });
            if (res.ok) {
                alert("Đã gửi báo cáo chiến dịch.");
                setCampaignReportModalOpen(false);
                setCampaignReportReason("");
            } else {
                const data = await res.json();
                alert(data.message || "Không thể gửi báo cáo");
            }
        } catch (err) {
            alert("Lỗi kết nối");
        }
    };

    const getAvatar = (user: any) => {
        return user?.profile?.avatarUrl || null;
    };

    /* ── Render ── */
    const fundingGoal = Number(campaign?.fundingGoalAmount ?? 0);
    const totalRaised = Number(campaign?.currentRaisedAmount ?? 0);
    // Use pre-calculated progress from API if available, otherwise calculate it
    const raisedPercent = campaign?.progress !== undefined
        ? Math.min(campaign.progress, 100)
        : (fundingGoal > 0 ? Math.min((totalRaised / fundingGoal) * 100, 100) : 0);

    const coverImage = campaign?.coverImageUrl || (campaign?.images?.length ? campaign.images[0].url : "");
    const galleryImages = campaign?.images?.length
        ? campaign.images.map((img: any) => img.url)
        : (campaign?.coverImageUrl ? [campaign.coverImageUrl] : []);

    return (
        <div
            className="min-h-screen -mx-3 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 bg-white pb-20 overflow-x-hidden"
        >
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white">
                    <div className="animate-spin h-10 w-10 border-b-2 border-blue-500" />
                    <p className="text-gray-600 font-medium tracking-wide">Loading campaign...</p>
                </div>
            )}

            {fetchError && (
                <div className="text-center py-24 bg-white/30 backdrop-blur-md">
                    <p className="text-red-500 font-bold">{fetchError}</p>
                </div>
            )}

            {!isLoading && !fetchError && campaign && (
                <div className="relative">
                    <CampaignHero coverImageUrl={coverImage} title={campaign?.title} />

                    {/* Container 1: Core Campaign Info */}
                    <div className="relative z-10 px-4 sm:px-8 pt-6 pb-8 max-w-7xl mx-auto mt-4 sm:mt-10">

                        <CampaignDescription description={campaign?.description} />

                        {/* Row 2: Layout tùy chỉnh - Cột trái = Cột phải */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            {/* CỘT TRÁI */}
                            <div className="flex flex-col gap-8 h-full">
                                <CampaignOverviewBox
                                    campaign={campaign}
                                    formatDate={formatDate}
                                />
                                <CampaignGalleryBox
                                    campaign={campaign}
                                    galleryImages={galleryImages}
                                    currentUser={currentUser}
                                    isLiked={isLiked}
                                    handleToggleLike={handleToggleLike}
                                    onReport={() => setCampaignReportModalOpen(true)}
                                />
                            </div>

                            {/* CỘT PHẢI - Equal Height with Left Column */}
                            <div className="lg:col-span-1 h-full">
                                <CampaignSidebar
                                    raisedPercent={raisedPercent}
                                    fundingGoal={fundingGoal}
                                    totalRaised={totalRaised}
                                    participantsCount={campaign?.participantsCount}
                                    isJoined={isJoined}
                                    hasDonated={hasDonatedUser}
                                    isLiked={isLiked}
                                    isCreator={currentUser?.id === campaign?.creatorUserId}
                                    campaignId={campaign?.id}
                                    status={campaign?.status}
                                    endAt={campaign?.endAt}
                                    autoCloseWhenGoalReached={campaign?.autoCloseWhenGoalReached}
                                    setDonateOpen={setDonateOpen}
                                    handleJoin={handleJoin}
                                    handleLeave={() => setShowLeaveModal(true)}
                                    handleToggleLike={handleToggleLike}
                                    onReport={() => setCampaignReportModalOpen(true)}
                                    formatCurrency={formatCurrency}
                                />
                            </div>
                        </div>
                    </div>

                    {(isJoined || currentUser?.id === campaign?.creatorUserId) && (
                        <CampaignTabs
                            campaign={campaign}
                            currentUser={currentUser}
                        />
                    )}

                    {/* Container 2: Community Discussion */}
                    <div className="px-4 sm:px-8 pb-12 max-w-7xl mx-auto mt-8">
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
                        />
                    </div>
                </div>
            )}

            <CampaignModals
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
                message={donationMessage}
                setMessage={setDonationMessage}

                reportModalOpen={reportModalOpen}
                setReportModalOpen={setReportModalOpen}
                reportReason={reportReason}
                setReportReason={setReportReason}
                handleReportComment={handleReportComment}

                campaignReportModalOpen={campaignReportModalOpen}
                setCampaignReportModalOpen={setCampaignReportModalOpen}
                campaignReportReason={campaignReportReason}
                setCampaignReportReason={setCampaignReportReason}
                handleReportCampaign={handleReportCampaign}
            />

            <LeaveCampaignModal
                showLeaveModal={showLeaveModal}
                setShowLeaveModal={setShowLeaveModal}
                handleLeave={handleLeave}
                isLeaving={isLeaving}
            />
        </div>
    );
}
