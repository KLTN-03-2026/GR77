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

export default function CampaignDetailClient({ id }: { id: string }) {
    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalReason, setWithdrawalReason] = useState('');
    const [withdrawalMethod, setWithdrawalMethod] = useState<'WALLET' | 'BANK'>('WALLET');
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
            const res = await fetch(`${API_BASE_URL}/campaigns/${id}/updates`, {
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

            alert('Cập nhật đã được đăng và thông báo đến người ủng hộ!');
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
                        <ShareIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                    </button>
                    <Link
                        href={`/creator/campaigns/${id}/edit`}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-100 border-2 border-blue-500 text-blue-700 font-bold text-sm shadow-sm hover:bg-blue-200 transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit Campaign
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Left Column: Cover, Info, Comments */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Cover Image Slider */}
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl ring-1 ring-black/5 group">
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
                        <div className="absolute top-6 left-6">
                            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 border border-blue-50/50">
                                <TagIcon className="h-4 w-4 text-blue-500 font-bold" strokeWidth={2.5} />
                                <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">{campaign.category || 'GENERAL'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Info */}
                    <div className="bg-white rounded-xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                            {campaign.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-8 py-5 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-bold text-gray-600">{campaign.locationText || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-bold text-gray-600">Created Date: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '---'}</span>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                Campaign Description
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-wrap font-medium">
                                {campaign.description || 'No description provided for this campaign yet.'}
                            </p>
                        </div>
                    </div>


                    {/* Discussion Section */}
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

                    {/* Transaction History Section */}
                    <CreatorTransactionHistory campaignId={id} />

                </div>

                {/* Right Column: Status, Funding, Wallet Button, Creator */}
                <div className="lg:col-span-4">
                    {/* Status and Funding Card */}
                    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-blue-50/50">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</span>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 shadow-sm border ${campaign.status === 'ACTIVE'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : campaign.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                <div className={`h-2 w-2 rounded-full animate-pulse ${campaign.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                {campaign.status === 'ACTIVE' ? 'ACTIVE' : campaign.status}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">{Number(campaign.currentRaisedAmount || 0).toLocaleString()}</span>
                                <span className="text-xs font-black text-gray-400 uppercase">VND</span>
                            </div>
                            <p className="text-[13px] font-bold text-gray-500 leading-relaxed">
                                raised out of <span className="font-black text-gray-900">{Number(campaign.fundingGoalAmount || 0).toLocaleString()} VND</span> funding goal
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3.5 bg-gray-100 rounded-full mb-8 overflow-hidden p-0.5 border border-gray-50">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 text-center hover:bg-gray-50 transition-all flex flex-col justify-center">
                                <div className="text-lg font-black text-blue-600 mb-1">{campaign.participantsCount || 0}</div>
                                <div className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">Joined</div>
                            </div>
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 text-center hover:bg-gray-50 transition-all flex flex-col justify-center">
                                <div className="text-lg font-black text-gray-900 mb-1">
                                    {campaign.endAt ? Math.max(0, Math.ceil((new Date(campaign.endAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '---'}
                                </div>
                                <div className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">Days left</div>
                            </div>
                        </div>

                        {/* Public Link Button */}
                        <div className="space-y-3 mb-8">
                            <Link
                                href={`/home/${campaign.id}`}
                                className="w-full bg-gray-50 border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-100 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                            >
                                <ShareIcon className="h-5 w-5" />
                                View Public Page
                            </Link>

                            <button
                                onClick={() => setWithdrawalModalOpen(true)}
                                className="w-full bg-green-50 border-2 border-green-500 hover:bg-green-200 text-green-700 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.55-.22-2.203-.702-1.172-.879-1.172-2.303 0-3.182 1.172-.879 3.07-.879 4.242 0 .493.37.79.88.879 1.414m-7.333 4.19-.068.581c-.135.53-.418 1.012-.879 1.414m-12.019-12 1.642 1.642" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25V7.5A2.25 2.25 0 0 0 12.75 5.25h-1.5A2.25 2.25 0 0 0 9 7.5v.75m6 7.5V16.5a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                                </svg>
                                Request Withdrawal
                            </button>
                        </div>

                        <div className="pt-8 border-t border-gray-100 text-left">
                            <div className="flex items-center gap-4 group">
                                <div className="relative">
                                    {creatorAvatar ? (
                                        <img src={creatorAvatar} alt={creatorName} className="h-14 w-14 rounded-full object-cover shadow-lg border-2 border-white transition-transform group-hover:scale-105 bg-white" />
                                    ) : (
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-105">
                                            <UserIcon className="w-7 h-7 text-cyan-300" />
                                        </div>
                                    )}
                                    {campaign.creatorUser?.isVerified && (
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-blue-500 rounded-full p-1 shadow-md border-2 border-white">
                                            <CheckBadgeIcon className="h-3.5 w-3.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Organizer</div>
                                    <div className="text-sm font-black text-gray-900 group-hover:text-blue-500 transition-colors">{creatorName}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Updates Section - Moved to Sidebar */}
                    <div className="bg-white rounded-xl p-6 sm:p-8 mt-8 shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-blue-50/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-blue-50 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 leading-none mb-1">Post an Update</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Notify your supporters
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                {creatorAvatar ? (
                                    <img src={creatorAvatar} alt="Your Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm bg-white" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                                        <UserIcon className="w-5 h-5 text-blue-300" />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={updateTitle}
                                    onChange={(e) => setUpdateTitle(e.target.value)}
                                    placeholder="Update Title..."
                                    className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-xs focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder-gray-400 font-bold"
                                />
                            </div>
                            <textarea
                                value={updateContent}
                                onChange={(e) => setUpdateContent(e.target.value)}
                                placeholder="Write your update here..."
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder-gray-400 font-medium resize-none mb-3"
                            ></textarea>
                            <button
                                onClick={handlePostUpdate}
                                disabled={isPostingUpdate || !updateTitle.trim() || !updateContent.trim()}
                                className="w-full bg-blue-500 border-2 border-blue-500 text-white text-[11px] font-black py-3.5 rounded-full hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 active:scale-95 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPostingUpdate ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    'Publish Update'
                                )}
                            </button>
                        </div>
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
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300 border border-gray-100">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white">
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
                            <form onSubmit={handleWithdrawalSubmit} className="p-8 space-y-6">
                                {/* Tab Picker */}
                                <div className="flex p-1 bg-gray-100 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawalMethod('WALLET')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${withdrawalMethod === 'WALLET' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Blockchain Wallet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawalMethod('BANK')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${withdrawalMethod === 'BANK' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Ngân hàng (Bank)
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2.5">
                                        Withdrawal Amount (VND)
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
                                            className={`w-full bg-white border rounded-2xl py-2.5 px-6 text-sm font-medium outline-none transition-all placeholder-gray-400 ${Number(withdrawalAmount) > (campaign.currentRaisedAmount || 0)
                                                ? 'text-red-500 border-red-500 focus:ring-1 focus:ring-red-500'
                                                : 'text-gray-900 border-gray-300 focus:border-black focus:ring-1 focus:ring-black'
                                                }`}
                                            required
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300">VND</span>
                                    </div>
                                    <div className="mt-2.5 flex justify-between items-center px-1">
                                        <span className="text-[10px] font-medium text-gray-900 uppercase tracking-widest">
                                            Available Balance:
                                        </span>
                                        <span className="text-xs font-black text-gray-900">
                                            {Number(campaign.currentRaisedAmount || 0).toLocaleString()} VND
                                        </span>
                                    </div>
                                    {Number(withdrawalAmount) > (campaign.currentRaisedAmount || 0) && (
                                        <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                                            ⚠️ Amount exceeds available balance
                                        </p>
                                    )}
                                </div>

                                {withdrawalMethod === 'WALLET' ? (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                                        {campaign.creatorUser?.wallet?.walletAddress ? (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-left">Receiving Polygon Wallet</p>
                                                <p className="text-xs font-mono text-blue-900 break-all">{campaign.creatorUser.wallet.walletAddress}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 py-2">
                                                <p className="text-xs font-bold text-blue-900">⚠️ You haven't connected a wallet!</p>
                                                <p className="text-[10px] text-blue-600 uppercase font-black leading-relaxed">Please go to the Wallet page to connect MetaMask.</p>
                                                <Link href="/wallet" className="inline-block text-[10px] font-black text-white bg-blue-500 px-6 py-2.5 rounded-xl uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">Connect Now</Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2">Bank Name</label>
                                                <input
                                                    type="text"
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                    placeholder="Ex: Vietcombank"
                                                    className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 text-xs font-medium focus:border-black outline-none transition-all"
                                                    required={withdrawalMethod === 'BANK'}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2">Account Number</label>
                                                <input
                                                    type="text"
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value)}
                                                    placeholder="Enter Acc No."
                                                    className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 text-xs font-medium focus:border-black outline-none transition-all"
                                                    required={withdrawalMethod === 'BANK'}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2">Account Owner</label>
                                            <input
                                                type="text"
                                                value={accountOwner}
                                                onChange={(e) => setAccountOwner(e.target.value)}
                                                placeholder="Ex: NGUYEN VAN A"
                                                className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 text-xs font-medium focus:border-black outline-none transition-all uppercase"
                                                required={withdrawalMethod === 'BANK'}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2.5">
                                        Withdrawal Reason
                                    </label>
                                    <textarea
                                        value={withdrawalReason}
                                        onChange={(e) => setWithdrawalReason(e.target.value)}
                                        placeholder="Please clarify the purpose of using this amount..."
                                        rows={3}
                                        className="w-full bg-white border border-gray-300 rounded-2xl py-4 px-6 text-sm font-medium focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400 resize-none text-gray-900"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setWithdrawalModalOpen(false)}
                                        disabled={isSubmittingWithdrawal}
                                        className="flex-1 px-4 py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 text-[11px] font-black rounded-2xl transition-all uppercase tracking-widest active:scale-95 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingWithdrawal || (withdrawalMethod === 'WALLET' && !campaign.creatorUser?.wallet?.walletAddress) || Number(withdrawalAmount) > (campaign.currentRaisedAmount || 0)}
                                        className={`flex-1 px-4 py-4 text-white text-[11px] font-black rounded-2xl shadow-lg transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 ${isSubmittingWithdrawal || (withdrawalMethod === 'WALLET' && !campaign.creatorUser?.wallet?.walletAddress) || Number(withdrawalAmount) > (campaign.currentRaisedAmount || 0)
                                            ? 'bg-gray-300 shadow-none cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-black shadow-green-100'
                                            }`}
                                    >
                                        {isSubmittingWithdrawal ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            'Submit Request'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Reuse Modals for Report etc. */}
            <CampaignModals
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
