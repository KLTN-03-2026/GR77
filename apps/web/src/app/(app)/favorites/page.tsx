'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
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

export default function FavoritesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);

    const fetchFavorites = useCallback(async (page: number) => {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            setError('Vui lòng đăng nhập để xem danh sách yêu thích.');
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:3001/favorites?page=${page}&limit=${ITEMS_PER_PAGE}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                if (res.status === 401) throw new Error('Phiên đăng nhập hết hạn.');
                throw new Error('Lỗi tải danh sách yêu thích.');
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

    // Fetch on mount and when page changes
    useEffect(() => {
        fetchFavorites(currentPage);
    }, [currentPage, fetchFavorites]);

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleFavorite = (id: string, nowFavorited: boolean) => {
        if (!nowFavorited) {
            // Remove from list if unfavorited instantly for better UX
            setCampaigns((prev) => prev.filter((c) => c.id !== id));

            // If the page is now empty and not page 1, optionally go back a page
            // Logic can be complex (re-fetching), so just let it be empty or manually refresh.
            if (campaigns.length === 1 && currentPage > 1) {
                setCurrentPage((p) => p - 1);
            }
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount: number | string) => {
        return Number(amount).toLocaleString('vi-VN');
    };

    return (
        <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HeartIcon className="w-7 h-7 text-pink-500" />
                        Favorite Campaigns
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 ml-9">
                        Chiến dịch bạn đã lưu
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-24 mb-14 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
                        <p className="text-gray-400 font-medium text-sm">Đang tải danh sách...</p>
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
                                    className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:border-pink-300 hover:shadow-md transition-all group block"
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
                                                <div className="h-full w-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
                                                    <Bars3CenterLeftIcon className="w-16 h-16 text-pink-300" />
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
                                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-pink-600 transition-colors">
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
                                                <span className="text-pink-500 font-extrabold">
                                                    {formatCurrency(campaign.fundingGoalAmount)} VND
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-400 mb-4">
                                                Ủng hộ tối thiểu: <span className="font-bold text-gray-600">{formatCurrency(campaign.minimumDonationAmount)} VND</span>
                                            </p>

                                            {/* Date info */}
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                <span>Ngày lưu: <span className="font-medium text-gray-700">{formatDate(campaign.favoritedAt)}</span></span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-4 items-center mt-6">
                                            <FavoriteButton
                                                campaignId={campaign.id}
                                                initialFavorited={true}
                                                onToggle={handleToggleFavorite}
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
                                                    ? "bg-pink-500 text-white shadow-lg shadow-pink-200 scale-110"
                                                    : "border border-gray-200 text-gray-500 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-300"
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
                        <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-600 mb-2">Chưa có đánh dấu</h2>
                        <p className="text-gray-500 mb-6">Bạn chưa lưu chiến dịch nào vào danh sách yêu thích.</p>
                        <Link href="/list" className="px-8 py-3 bg-pink-500 text-white font-bold rounded-full shadow-lg shadow-pink-200 hover:scale-105 transition-all inline-block">
                            Khám phá ngay
                        </Link>
                    </div>
                )}
            </div>
    );
}