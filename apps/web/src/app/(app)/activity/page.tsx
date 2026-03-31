'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Bars3CenterLeftIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import FavoriteButton from '@/components/campaign/FavoriteButton';

const ITEMS_PER_PAGE = 9;

// Pagination helper
function getPageNumbers(current: number, total: number) {
    const delta = 1;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let last: number | undefined;
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }
    for (const i of range) {
        if (last !== undefined && typeof i === 'number' && i - last > 1) {
            rangeWithDots.push('...');
        }
        rangeWithDots.push(i);
        if (typeof i === 'number') last = i;
    }
    return rangeWithDots;
}

export default function ActivityPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);

    const fetchViewHistories = useCallback(async (page: number) => {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            setError('Vui lòng đăng nhập để xem lịch sử hoạt động.');
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:3001/view-histories?page=${page}&limit=${ITEMS_PER_PAGE}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                if (res.status === 401) throw new Error('Phiên đăng nhập hết hạn.');
                throw new Error('Lỗi tải lịch sử hoạt động.');
            }

            const data = await res.json();
            setCampaigns(data.items || []);
            setTotalPages(data.meta?.totalPages || 0);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchViewHistories(currentPage);
    }, [currentPage, fetchViewHistories]);

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return '';
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Vừa xong';
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return formatDate(dateString);
    };

    const formatCurrency = (amount: number | string) => {
        return Number(amount).toLocaleString('vi-VN');
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ClockIcon className="w-7 h-7 text-cyan-500" />
                    Activity History
                </h1>
                <p className="text-sm text-gray-400 mt-1 ml-9">Your recent activity will appear here.</p>
            </div>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center py-24 mb-14 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
                    <p className="text-gray-400 font-medium text-sm">Đang tải lịch sử...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col justify-center items-center py-24 mb-14 border-2 border-dashed border-red-200 rounded-2xl bg-red-50 text-red-500 font-medium p-4 text-center">
                    <p className="mb-4">{error}</p>
                    <Link href="/login" className="px-6 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors">
                        Đến trang đăng nhập
                    </Link>
                </div>
            ) : campaigns.length > 0 ? (
                <>
                    <div className="space-y-6 mb-8">
                        {campaigns.map((campaign) => (
                            <Link
                                key={campaign.id}
                                href={`/home/${campaign.id}`}
                                className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:border-cyan-300 hover:shadow-md transition-all group block"
                            >
                                {/* Image */}
                                <div className="w-full md:w-[35%] p-4 h-56 md:h-auto relative">
                                    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                                        {campaign.coverImageUrl ? (
                                            <img
                                                src={campaign.coverImageUrl}
                                                alt={campaign.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center">
                                                <Bars3CenterLeftIcon className="w-16 h-16 text-cyan-300" />
                                            </div>
                                        )}
                                        {/* Status badge */}
                                        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase ${campaign.status === 'ACTIVE'
                                            ? 'bg-green-100/90 text-green-700'
                                            : 'bg-yellow-100/90 text-yellow-700'
                                            }`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-cyan-600 transition-colors">
                                                {campaign.title}
                                            </h2>
                                        </div>

                                        {/* Location & Category */}
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 flex-wrap">
                                            <span className="capitalize bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-700">
                                                {campaign.category}
                                            </span>
                                            {campaign.locationText && (
                                                <div className="flex items-center gap-1">
                                                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                                                    <span>{campaign.locationText}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Goals */}
                                        <p className="text-lg font-bold text-slate-700 mb-1">
                                            Mục tiêu{' '}
                                            <span className="text-cyan-500 font-extrabold">
                                                {formatCurrency(campaign.fundingGoalAmount)} VND
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400 mb-4">
                                            Ủng hộ tối thiểu: <span className="font-bold text-gray-600">{formatCurrency(campaign.minimumDonationAmount)} VND</span>
                                        </p>

                                        {/* Last viewed info */}
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            <span>Đã xem: <span className="font-medium text-gray-700">{formatRelativeTime(campaign.lastViewedAt)}</span></span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-4 items-center mt-6">
                                        <FavoriteButton
                                            campaignId={campaign.id}
                                            initialFavorited={campaign.isFavorited || false}
                                        />
                                        <span className="flex-1 md:flex-none px-8 py-3 bg-white border-2 border-[#FFD700] text-yellow-600 font-bold rounded-full text-center text-sm shadow-sm transition-all flex items-center justify-center gap-2">
                                            Xem & Ủng Hộ
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination Component */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
                            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                                typeof item === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(item)}
                                        className={`
                                            w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all
                                            ${currentPage === item
                                                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-200 scale-110"
                                                : "border border-gray-200 text-gray-500 hover:bg-cyan-50 hover:text-cyan-500 hover:border-cyan-300"
                                            }
                                        `}
                                    >
                                        {item}
                                    </button>
                                ) : (
                                    <span key={idx} className="px-2 text-gray-400">{item}</span>
                                )
                            )}
                        </div>
                    )}
                </>
            ) : (
                // Empty state
                <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                    <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Chưa có lịch sử</h2>
                    <p className="text-gray-500 mb-6">Bạn chưa xem chiến dịch nào.</p>
                    <Link href="/list" className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-full shadow-lg shadow-cyan-200 hover:scale-105 transition-all inline-block">
                        Khám phá ngay
                    </Link>
                </div>
            )}
        </div>
    );
}
