'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
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

export default function CampaignDetailClient({ id }: { id: string }) {
    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalReason, setWithdrawalReason] = useState('');
    const [withdrawalMethod, setWithdrawalMethod] = useState<'WALLET' | 'BANK'>('WALLET');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountOwner, setAccountOwner] = useState('');
    const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await fetch(`http://localhost:3001/campaigns/${id}`);
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
        }
    }, [id]);

    const handleWithdrawalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!withdrawalAmount || !withdrawalReason) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setIsSubmittingWithdrawal(true);
        try {
            const token = localStorage.getItem('accessToken');
            const data = {
                amount: Number(withdrawalAmount),
                reason: withdrawalReason,
                method: withdrawalMethod,
                ...(withdrawalMethod === 'BANK' ? { bankName, accountNumber, accountOwner } : {})
            };

            const response = await fetch(`http://localhost:3001/withdrawals/campaign/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Gửi yêu cầu thất bại');
            }

            alert('Gửi yêu cầu rút tiền thành công! Vui lòng chờ phê duyệt.');
            setWithdrawalModalOpen(false);
            setWithdrawalAmount('');
            setWithdrawalReason('');
            setBankName('');
            setAccountNumber('');
            setAccountOwner('');
        } catch (err: any) {
            alert(`Lỗi: ${err.message}`);
        } finally {
            setIsSubmittingWithdrawal(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 font-medium">Đang tải dữ liệu chiến dịch...</p>
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
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy chiến dịch</h2>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">{error || 'Vui lòng kiểm tra lại đường dẫn hoặc quay lại danh sách chiến dịch.'}</p>
                    <Link href="/creator/campaigns" className="inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all active:scale-95">
                        Quay lại Danh sách
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

    const creatorAvatar = campaign.creatorUser?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${campaign.creatorUserId}`;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (isNaN(diffInSeconds)) return 'Ngày không xác định';
        if (diffInSeconds < 0) return 'Vừa xong';
        if (diffInSeconds < 60) return 'Vừa xong';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
        return `${Math.floor(diffInDays / 365)} năm trước`;
    };

    const toggleReplies = (commentId: string) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
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
                    QUAY LẠI CHIẾN DỊCH
                </Link>
                <div className="flex gap-2">
                    <button className="p-2.5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:bg-gray-50 transition-all active:scale-95 group" title="Chia sẻ">
                        <ShareIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                    </button>
                    <Link
                        href={`/creator/campaigns/${id}/edit`}
                        className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white border border-blue-100 text-blue-600 font-bold text-[13px] shadow-sm hover:bg-blue-50 transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        CHỈNH SỬA
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Left Column: Cover, Info, Comments */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Cover Image Slider */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5 group">
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
                                <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">{campaign.category || 'CHUNG'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Info */}
                    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                            {campaign.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-8 py-5 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-bold text-gray-600">{campaign.locationText || 'Không xác định'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-bold text-gray-600">Ngày tạo: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString('vi-VN') : '---'}</span>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                Mô tả chiến dịch
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-wrap font-medium">
                                {campaign.description || 'Chưa có mô tả cụ thể cho chiến dịch này.'}
                            </p>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-none mb-1.5">Thảo luận</h2>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{campaign.comments?.length || 0} Ý kiến đóng góp</p>
                            </div>
                        </div>

                        <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar lg:min-h-[200px]">
                            {campaign.comments && campaign.comments.length > 0 ? (
                                <div className="space-y-10">
                                    {campaign.comments.map((comment: any) => {
                                        const replies = comment.replies || [];
                                        const isExpanded = expandedReplies[comment.id];
                                        const displayedReplies = isExpanded ? replies : replies.slice(0, 1);

                                        return (
                                            <div key={comment.id} className="space-y-6">
                                                {/* Parent Comment */}
                                                <div className="flex gap-3 text-left items-start group">
                                                    <img
                                                        src={comment.user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.id || comment.userId}`}
                                                        alt={comment.user?.username}
                                                        className="h-12 w-12 rounded-full object-cover ring-4 ring-white shadow-sm"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="mb-0.5">
                                                            <span className="text-sm font-black text-gray-900">{comment.user?.username || 'Người dùng'}</span>
                                                        </div>
                                                        <p className="text-[13px] text-gray-600 leading-relaxed font-semibold bg-gray-50/50 p-4 rounded-2xl rounded-tl-none border border-gray-100/50 group-hover:bg-gray-50 transition-all">
                                                            {comment.content}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatTimeAgo(comment.createdAt)}</span>
                                                            <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors">
                                                                Trả lời
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Replies */}
                                                {replies.length > 0 && (
                                                    <div className="ml-10 sm:ml-16 space-y-6 border-l-2 border-gray-50 pl-6 sm:pl-10">
                                                        {displayedReplies.map((reply: any) => (
                                                            <div key={reply.id} className="flex gap-3 text-left items-start group">
                                                                <img
                                                                    src={reply.user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user?.id || reply.userId}`}
                                                                    alt={reply.user?.username}
                                                                    className="h-10 w-10 rounded-full object-cover ring-4 ring-white shadow-sm"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="mb-0.5">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="text-[13px] font-black text-gray-900">{reply.user?.username || 'Người dùng'}</span>
                                                                            {reply.user?.id !== comment.user?.id && (
                                                                                <>
                                                                                    <span className="text-[12px] font-black text-gray-400">›</span>
                                                                                    <span className="text-[13px] font-bold text-blue-500">{comment.user?.username}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-[13px] text-gray-600 leading-relaxed font-semibold bg-blue-50/20 p-4 rounded-2xl rounded-tl-none border border-blue-50/50 group-hover:bg-blue-50/30 transition-all">
                                                                        {reply.content}
                                                                    </p>
                                                                    <div className="flex items-center gap-4 mt-2">
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatTimeAgo(reply.createdAt)}</span>
                                                                        <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors">
                                                                            Trả lời
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {!isExpanded && replies.length > 1 && (
                                                            <button
                                                                onClick={() => toggleReplies(comment.id)}
                                                                className="text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                                                            >
                                                                <div className="w-6 h-[2px] bg-gray-100 group-hover:bg-blue-100 transition-all"></div>
                                                                XEM THÊM {replies.length - 1} CÂU TRẢ LỜI
                                                            </button>
                                                        )}
                                                        {isExpanded && replies.length > 1 && (
                                                            <button
                                                                onClick={() => toggleReplies(comment.id)}
                                                                className="text-[10px] font-black text-blue-400 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                                                            >
                                                                <div className="w-6 h-[2px] bg-blue-100 transition-all"></div>
                                                                THU GỌN THẢO LUẬN
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <div className="pt-6 flex justify-center border-t border-gray-50">
                                        <button className="flex items-center gap-2 px-8 py-3 rounded-2xl border-2 border-gray-100 text-[11px] font-black text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/30 transition-all uppercase tracking-widest active:scale-95">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            Hiện thêm thảo luận
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <ChatBubbleLeftEllipsisIcon className="h-8 w-8 text-gray-200" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Chưa có thảo luận nào</p>
                                    <p className="text-[11px] text-gray-400 mt-2">Hãy là người đầu tiên để lại ý kiến của bạn!</p>
                                </div>
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className="mt-10 pt-10 border-t border-gray-100">
                            <div className="flex gap-4">
                                <img
                                    src={creatorAvatar}
                                    alt="Your Avatar"
                                    className="h-12 w-12 rounded-full object-cover ring-4 ring-white shadow-md border border-gray-100"
                                />
                                <div className="flex-1 relative">
                                    <textarea
                                        placeholder="Bạn nghĩ gì về chiến dịch này? Để lại ý kiến của bạn tại đây..."
                                        rows={1}
                                        className="w-full bg-gray-50 border-gray-100 rounded-3xl py-4 px-6 pr-24 text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all placeholder-gray-400 font-bold overflow-hidden min-h-[56px] shadow-sm hover:shadow-md focus:shadow-lg"
                                    ></textarea>
                                    <button className="absolute right-2 top-2 bg-blue-500 text-white text-[11px] font-black px-6 py-2.5 rounded-2xl hover:bg-black transition-all shadow-md active:scale-95 uppercase tracking-widest">
                                        Gửi
                                    </button>
                                </div>
                            </div>
                            <p className="mt-4 text-center text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1.5 uppercase tracking-widest">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-500">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4.13-5.689Z" clipRule="evenodd" />
                                </svg>
                                Bình luận công khai dưới tên {creatorName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Status, Funding, Wallet Button, Creator */}
                <div className="lg:col-span-4">
                    {/* Status and Funding Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-blue-50/50">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái hiện tại</span>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 shadow-sm border ${campaign.status === 'ACTIVE'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : campaign.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                <div className={`h-2 w-2 rounded-full animate-pulse ${campaign.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                {campaign.status === 'ACTIVE' ? 'ĐANG HOẠT ĐỘNG' : campaign.status}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">{Number(campaign.currentRaisedAmount || 0).toLocaleString()}</span>
                                <span className="text-xs font-black text-gray-400 uppercase">VND</span>
                            </div>
                            <p className="text-[13px] font-bold text-gray-500 leading-relaxed">
                                đạt được trên <span className="font-black text-gray-900">{Number(campaign.fundingGoalAmount || 0).toLocaleString()} VND</span> mục tiêu đóng góp
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3.5 bg-gray-100 rounded-full mb-8 overflow-hidden p-0.5 border border-gray-50">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 text-center hover:bg-gray-50 transition-all">
                                <div className="text-xl font-black text-gray-900 mb-1">{campaign._count?.donations || 0}</div>
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Người ủng hộ</div>
                            </div>
                            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 text-center hover:bg-gray-50 transition-all">
                                <div className="text-xl font-black text-gray-900 mb-1">
                                    {campaign.endAt ? Math.max(0, Math.ceil((new Date(campaign.endAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '---'}
                                </div>
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ngày còn lại</div>
                            </div>
                        </div>

                        {/* Public Link Button */}
                        <div className="space-y-4 mb-8">
                            <Link
                                href={`/home/${campaign.id}`}
                                className="w-full bg-gray-900 hover:bg-black text-white py-4.5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] text-[11px] uppercase tracking-widest border border-gray-800"
                            >
                                <ShareIcon className="h-4 w-4" />
                                Xem trang công khai
                            </Link>

                            <button
                                onClick={() => setWithdrawalModalOpen(true)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-4.5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-green-100 transition-all active:scale-[0.98] text-[11px] uppercase tracking-widest border border-green-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.55-.22-2.203-.702-1.172-.879-1.172-2.303 0-3.182 1.172-.879 3.07-.879 4.242 0 .493.37.79.88.879 1.414m-7.333 4.19-.068.581c-.135.53-.418 1.012-.879 1.414m-12.019-12 1.642 1.642" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25V7.5A2.25 2.25 0 0 0 12.75 5.25h-1.5A2.25 2.25 0 0 0 9 7.5v.75m6 7.5V16.5a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                                </svg>
                                Yêu cầu rút tiền
                            </button>
                        </div>

                        <div className="pt-8 border-t border-gray-100 text-left">
                            <div className="flex items-center gap-4 group">
                                <div className="relative">
                                    <img src={creatorAvatar} alt={creatorName} className="h-14 w-14 rounded-full object-cover shadow-lg border-2 border-white transition-transform group-hover:scale-105" />
                                    {campaign.creatorUser?.isVerified && (
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-blue-500 rounded-full p-1 shadow-md border-2 border-white">
                                            <CheckBadgeIcon className="h-3.5 w-3.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Người tổ chức</div>
                                    <div className="text-sm font-black text-gray-900 group-hover:text-blue-500 transition-colors">{creatorName}</div>
                                </div>
                            </div>
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
                                    Yêu cầu rút tiền
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
                                        Số tiền muốn rút (VNĐ)
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
                                            placeholder="Nhập số tiền..."
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
                                            Số tiền hiện có:
                                        </span>
                                        <span className="text-xs font-black text-gray-900">
                                            {Number(campaign.currentRaisedAmount || 0).toLocaleString()} VNĐ
                                        </span>
                                    </div>
                                    {Number(withdrawalAmount) > (campaign.currentRaisedAmount || 0) && (
                                        <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                                            ⚠️ Số tiền vượt quá số dư hiện có
                                        </p>
                                    )}
                                </div>

                                {withdrawalMethod === 'WALLET' ? (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                                        {campaign.creatorUser?.wallet?.walletAddress ? (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-left">Ví Polygon nhận tiền</p>
                                                <p className="text-xs font-mono text-blue-900 break-all">{campaign.creatorUser.wallet.walletAddress}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 py-2">
                                                <p className="text-xs font-bold text-blue-900">⚠️ Bạn chưa liên kết ví!</p>
                                                <p className="text-[10px] text-blue-600 uppercase font-black leading-relaxed">Vui lòng vào trang Wallet để kết nối MetaMask.</p>
                                                <Link href="/wallet" className="inline-block text-[10px] font-black text-white bg-blue-500 px-6 py-2.5 rounded-xl uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">Kết nối ngay</Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2">Tên ngân hàng</label>
                                                <input
                                                    type="text"
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                    placeholder="VD: Vietcombank"
                                                    className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 text-xs font-medium focus:border-black outline-none transition-all"
                                                    required={withdrawalMethod === 'BANK'}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2">Số tài khoản</label>
                                                <input
                                                    type="text"
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value)}
                                                    placeholder="Nhập số TK"
                                                    className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 text-xs font-medium focus:border-black outline-none transition-all"
                                                    required={withdrawalMethod === 'BANK'}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2">Tên chủ tài khoản</label>
                                            <input
                                                type="text"
                                                value={accountOwner}
                                                onChange={(e) => setAccountOwner(e.target.value)}
                                                placeholder="VD: NGUYEN VAN A"
                                                className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-4 text-xs font-medium focus:border-black outline-none transition-all uppercase"
                                                required={withdrawalMethod === 'BANK'}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-medium text-gray-900 uppercase tracking-widest mb-2.5">
                                        Lý do rút tiền
                                    </label>
                                    <textarea
                                        value={withdrawalReason}
                                        onChange={(e) => setWithdrawalReason(e.target.value)}
                                        placeholder="Vui lòng nêu rõ mục đích sử dụng số tiền này..."
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
                                        Hủy
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
                                            'Gửi yêu cầu'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
