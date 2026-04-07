"use client";

import { use } from "react";
import { useGlobalAuth } from "@/contexts/AuthContext";

// Shared Components
import { CampaignDiscussion } from "@/components/campaign/CampaignDiscussion";

// Local Sub-components
import { CampaignHero } from "./_components/CampaignHero";
import { CampaignDescription } from "./_components/CampaignDescription";
import { CampaignOverviewBox } from "./_components/CampaignOverviewBox";
import { CampaignGalleryBox } from "./_components/CampaignGalleryBox";
import { CampaignSidebar } from "./_components/CampaignSidebar";
import { CampaignModals } from "./_components/CampaignModals";

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

    const coverImage = campaign?.coverImageUrl || (campaign?.images?.length ? campaign.images[0].url : "");
    const galleryImages = campaign?.images?.length
        ? campaign.images.map((img: any) => img.url)
        : (campaign?.coverImageUrl ? [campaign.coverImageUrl] : []);

    return (
        <div
            className="min-h-screen -mx-[34px] -mt-[34px] bg-white pb-20 overflow-x-hidden"
            style={{ width: 'calc(100% + 68px)' }}
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
                    <div className="relative z-10 px-8 pt-6 pb-8 max-w-7xl mx-auto mt-6">

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
                                />
                            </div>

                            {/* CỘT PHẢI */}
                            <CampaignSidebar
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
                        </div>
                    </div>

                    {/* Container 2: Community Discussion */}
                    <div className="px-8 pb-12 max-w-7xl mx-auto mt-8">
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

                reportModalOpen={reportModalOpen}
                setReportModalOpen={setReportModalOpen}
                reportReason={reportReason}
                setReportReason={setReportReason}
                handleReportComment={handleReportComment}
            />
        </div>
    );
}
