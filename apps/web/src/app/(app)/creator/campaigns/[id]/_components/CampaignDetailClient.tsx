'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    UserIcon,
    ArrowLeftIcon,
    MapPinIcon,
    TagIcon,
    CalendarIcon,
    WalletIcon,
    ChatBubbleLeftEllipsisIcon,
    ShareIcon,
    HeartIcon,
    EllipsisHorizontalIcon,
    CheckBadgeIcon,
    PhotoIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useGlobalAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/constants/endpoints';
import { CampaignDiscussion } from '@/components/campaign/CampaignDiscussion';
import { CampaignModals } from '@/app/(app)/home/[id]/_components/CampaignModals';
import { CreatorTransactionHistory } from '../../components/CreatorTransactionHistory';
import { CreatorCampaignHeader } from './CreatorCampaignHeader';
import { CreatorCampaignProgress } from './CreatorCampaignProgress';
import { CreatorCampaignStats } from './CreatorCampaignStats';
import { CreatorCampaignNews } from './CreatorCampaignNews';

export default function CampaignDetailClient({ id }: { id: string }) {
    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [withdrawalReason, setWithdrawalReason] = useState('');
    const [withdrawalMethod, setWithdrawalMethod] = useState<'WALLET' | 'BANK'>('BANK');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountOwner, setAccountOwner] = useState('');
    const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

    const { user: currentUser } = useGlobalAuth();
    const router = useRouter();

    // Post Update State
    const [updateTitle, setUpdateTitle] = useState('');
    const [updateContent, setUpdateContent] = useState('');
    const [isPostingUpdate, setIsPostingUpdate] = useState(false);



    // Comment states
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [isCommenting, setIsCommenting] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState("");

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
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to fetch campaign details');
                }
                const data = await response.json();
                setCampaign(data);
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCampaign();
            fetchComments();
        }
    }, [id]);

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
            const res = await fetch(`${API_BASE_URL}/comments`, {
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
            const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
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
            const res = await fetch(`${API_BASE_URL}/comments/${reportingCommentId}/report`, {
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
        return user?.profile?.avatarUrl || null;
    };

    const handleWithdrawalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmittingWithdrawal(true);
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/withdrawals/campaign/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: Number(withdrawalAmount),
                    reason: withdrawalReason || 'Yêu cầu rút tiền',
                    method: withdrawalMethod,
                    ...(withdrawalMethod === 'BANK' ? { bankName, accountNumber, accountOwner } : {})
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Lỗi gửi yêu cầu rút tiền');
            }

            alert('Yêu cầu rút tiền đã được gửi thành công. Vui lòng chờ phê duyệt.');
            setWithdrawalModalOpen(false);
            setWithdrawalAmount('');

            // Reload campaign
            const reloadRes = await fetch(`${API_BASE_URL}/campaigns/${id}`);
            if (reloadRes.ok) {
                const data = await reloadRes.json();
                setCampaign(data);
            }
        } catch (error: any) {
            console.error('Lỗi rút tiền:', error);
            alert(error.message || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền');
        } finally {
            setIsSubmittingWithdrawal(false);
        }
    };

    const handlePostUpdate = async () => {
        if (!updateTitle.trim() || !updateContent.trim()) {
            alert('Vui lòng nhập đầy đủ tiêu đề và nội dung cập nhật.');
            return;
        }
        setIsPostingUpdate(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE_URL}/campaigns/${id}/news`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: updateTitle,
                    content: updateContent,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Lỗi đăng cập nhật');
            }

            alert('Bản tin mới đã được đăng và thông báo đến người ủng hộ!');
            setUpdateTitle('');
            setUpdateContent('');

            // Reload campaign data to show new update
            const reloadRes = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (reloadRes.ok) {
                const data = await reloadRes.json();
                setCampaign(data);
            }
        } catch (err: any) {
            console.error('Post update error:', err);
            alert(err.message || 'Có lỗi xảy ra khi đăng cập nhật.');
        } finally {
            setIsPostingUpdate(false);
        }
    };

    // Auto-slide effect
    useEffect(() => {
        if (!campaign) return;
        const currentImages = campaign.images?.length
            ? campaign.images.map((img: any) => img.url).filter(Boolean)
            : (campaign.coverImageUrl ? [campaign.coverImageUrl] : []);

        if (currentImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, [campaign]);

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 font-medium">Loading campaign data...</p>
                </div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="w-full flex items-center justify-center py-20 px-4">
                <div className="bg-white border border-gray-100 p-8 rounded-3xl text-center max-w-lg shadow-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Campaign not found</h2>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">{error || 'Please check the link or return to the campaign list.'}</p>
                    <Link href="/creator/campaigns" className="inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all active:scale-95">
                        Back to List
                    </Link>
                </div>
            </div>
        );
    }

    const progress = Number(campaign.progress || 0);
    const images = campaign.images?.length
        ? campaign.images.map((img: any) => img.url).filter(Boolean)
        : (campaign.coverImageUrl ? [campaign.coverImageUrl] : []);

    const creatorName = campaign.creatorUser?.profile
        ? `${campaign.creatorUser.profile.firstName || ''} ${campaign.creatorUser.profile.lastName || ''}`.trim() || campaign.creatorUser.username
        : campaign.creatorUser?.username || 'Người dùng';

    const creatorAvatar = campaign.creatorUser?.profile?.avatarUrl || null;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="w-full pb-20 text-gray-800">
            {/* Breadcrumbs / Back navigation */}
            <div className="mb-6 flex items-center justify-between px-2 sm:px-0">
                <Link
                    href="/creator/campaigns"
                    className="inline-flex items-center text-[13px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" strokeWidth={3} />
                    BACK TO CAMPAIGNS
                </Link>
                <div className="flex gap-2">
                    <button className="p-2.5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:bg-gray-50 transition-all active:scale-95 group" title="Chia sẻ">
                        <ShareIcon className="h-4 w-4 text-gray-500 group-hover:text-[#0891B2] transition-colors" />
                    </button>
                    {campaign.status === 'COMPLETED' ? (
                        <div className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 border-2 border-gray-200 text-gray-400 font-bold text-sm cursor-not-allowed opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            Edit Campaign
                        </div>
                    ) : (
                        <Link
                            href={`/creator/campaigns/${id}/edit`}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0891B2]/5 border-2 border-[#0891B2] text-[#0891B2] font-bold text-sm shadow-sm hover:bg-[#0891B2] hover:text-white transition-all active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            Edit Campaign
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {/* Row 1: Image & Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4">
                        <div className="relative aspect-square rounded-xl overflow-hidden shadow-md ring-1 ring-black/5 group">
                            {images.length > 0 ? (
                                <>
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={campaign.title || 'Campaign image'}
                                        className="w-full h-full object-cover transition-all duration-500"
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/20"
                                            >
                                                <ChevronLeftIcon className="h-5 w-5 stroke-[3]" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/20 backdrop-blur-md hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/20"
                                            >
                                                <ChevronRightIcon className="h-5 w-5 stroke-[3]" />
                                            </button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {images.map((_: string, i: number) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/50 hover:bg-white'}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                    <PhotoIcon className="h-20 w-20 text-gray-200" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-8">
                        <CreatorCampaignHeader campaign={campaign} setWithdrawalModalOpen={setWithdrawalModalOpen} />
                    </div>
                </div>

                {/* Row 2: Description */}
                <div className="py-2">
                    <h3 className="text-lg font-black text-gray-900 italic mb-4">
                        Campaign Description
                    </h3>
                    <div className="relative">
                        <p className={`text-gray-600 text-justify leading-relaxed text-sm whitespace-pre-wrap font-medium transition-all duration-500 ease-in-out overflow-hidden ${!showFullDescription && (campaign.description?.length > 800) ? 'max-h-[150px]' : 'max-h-[2000px]'}`}>
                            {campaign.description || 'No description provided for this campaign yet.'}
                        </p>

                        {campaign.description?.length > 800 && (
                            <>
                                {!showFullDescription && (
                                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                                )}
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="text-gray-500 font-bold text-xs mt-2 hover:text-[#0891B2] transition-colors relative z-10"
                                >
                                    {showFullDescription ? 'Collapse' : 'See more...'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Row 3: Progress & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <CreatorCampaignProgress campaign={campaign} progress={progress} />
                    </div>
                    <div className="lg:col-span-4">
                        <CreatorCampaignStats campaign={campaign} />
                    </div>
                </div>

                {/* Row 4: News & History */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6">
                        <CreatorCampaignNews
                            campaign={campaign}
                            updateTitle={updateTitle}
                            setUpdateTitle={setUpdateTitle}
                            updateContent={updateContent}
                            setUpdateContent={setUpdateContent}
                            isPostingUpdate={isPostingUpdate}
                            handlePostUpdate={handlePostUpdate}
                            creatorAvatar={creatorAvatar}
                        />
                    </div>
                    <div className="lg:col-span-6">
                        <CreatorTransactionHistory campaignId={id} />
                    </div>
                </div>

                {/* Row 5: Discussion */}
                <div className="mt-8">
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

            {/* Withdrawal Modal */}
            {withdrawalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => !isSubmittingWithdrawal && setWithdrawalModalOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300 border border-gray-100 flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white flex-shrink-0">
                            <h3 className="text-xl font-bold flex items-center gap-3 uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.55-.22-2.203-.702-1.172-.879-1.172-2.303 0-3.182 1.172-.879 3.07-.879 4.242 0 .493.37.79.88.879 1.414" />
                                </svg>
                                Request Withdrawal
                            </h3>
                            <p className="text-green-50 text-xs mt-2 font-bold uppercase tracking-widest opacity-80">
                                Chiến dịch: {campaign.title}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleWithdrawalSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            {/* Tab Picker */}
                            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-xl">🏦</div>
                                <div>
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-0.5">Phương thức rút tiền</p>
                                    <p className="text-base font-black text-green-900">Chuyển khoản Ngân hàng (VND)</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Số tiền muốn rút (VND)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={withdrawalAmount}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setWithdrawalAmount(value);
                                        }}
                                        placeholder="Enter amount..."
                                        className={`w-full bg-white border-2 rounded-2xl py-3.5 px-6 text-lg font-black outline-none transition-all placeholder-gray-300 ${Number(withdrawalAmount) > (Number(campaign.currentBalance || campaign.currentRaisedAmount || 0))
                                            ? 'text-red-600 border-red-500 focus:ring-2 focus:ring-red-100'
                                            : 'text-black border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50'
                                            }`}
                                        required
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300">VND</span>
                                </div>
                                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center px-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Số dư quỹ hiện tại
                                        </span>
                                        <span className="text-lg font-black text-green-600">
                                            {Number(campaign.currentBalance || 0).toLocaleString()} VND
                                        </span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                            Tương đương POL
                                        </span>
                                        <span className="text-sm font-black text-blue-600 flex items-center gap-1">
                                            <span className="text-base">💎</span>
                                            {(Number(campaign.currentBalance || 0) / 1000).toFixed(2)} POL
                                        </span>
                                    </div>
                                </div>
                                {Number(withdrawalAmount) > Number(campaign.currentBalance || 0) && (
                                    <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse px-1">
                                        ⚠️ Số tiền rút vượt quá số dư khả dụng trong quỹ
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tên ngân hàng</label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        placeholder="Ví dụ: Vietcombank"
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold text-black focus:bg-white focus:border-green-500 outline-none transition-all placeholder-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Số tài khoản</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="Số tài khoản..."
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold text-black focus:bg-white focus:border-green-500 outline-none transition-all placeholder-gray-400"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tên chủ tài khoản</label>
                                <input
                                    type="text"
                                    value={accountOwner}
                                    onChange={(e) => setAccountOwner(e.target.value)}
                                    placeholder="VD: NGUYEN VAN A"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold text-black focus:bg-white focus:border-green-500 outline-none transition-all placeholder-gray-400 uppercase"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5">
                                    Lý do rút tiền
                                </label>
                                <textarea
                                    value={withdrawalReason}
                                    onChange={(e) => setWithdrawalReason(e.target.value)}
                                    placeholder="Mô tả mục đích giải ngân..."
                                    rows={3}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-black focus:bg-white focus:border-green-500 outline-none transition-all placeholder-gray-400 resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setWithdrawalModalOpen(false)}
                                    disabled={isSubmittingWithdrawal}
                                    className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-[11px] font-black rounded-2xl transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingWithdrawal || Number(withdrawalAmount) <= 0 || Number(withdrawalAmount) > (Number(campaign.currentBalance || campaign.currentRaisedAmount || 0))}
                                    className={`flex-1 px-4 py-4 text-white text-[11px] font-black rounded-2xl shadow-lg transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 ${isSubmittingWithdrawal || Number(withdrawalAmount) <= 0 || Number(withdrawalAmount) > (Number(campaign.currentBalance || campaign.currentRaisedAmount || 0))
                                        ? 'bg-gray-300 shadow-none cursor-not-allowed opacity-50'
                                        : 'bg-green-600 hover:bg-black shadow-green-100'
                                        }`}
                                >
                                    {isSubmittingWithdrawal ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Gửi yêu cầu rút tiền'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }

            {/* Reuse Modals for Report etc. */}
            < CampaignModals
                donateOpen={false}
                setDonateOpen={() => { }}
                donateAmount=""
                setDonateAmount={() => { }}
                isDonating={false}
                donated={false}
                setDonated={() => { }}
                donationMethod="PAYOS"
                setDonationMethod={() => { }}
                blockchainLoading={false}
                blockchainError={null}
                setBlockchainError={() => { }}
                handleDonate={() => { }}
                handleBlockchainDonate={() => { }}
                QUICK_AMOUNTS={[]}
                message=""
                setMessage={() => { }}

                reportModalOpen={reportModalOpen}
                setReportModalOpen={setReportModalOpen}
                reportReason={reportReason}
                setReportReason={setReportReason}
                handleReportComment={handleReportComment}

                campaignReportModalOpen={false}
                setCampaignReportModalOpen={() => { }}
                campaignReportReason=""
                setCampaignReportReason={() => { }}
                handleReportCampaign={async () => { }}
            />
        </div >
    );
}
