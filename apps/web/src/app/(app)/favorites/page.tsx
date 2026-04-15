'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
import { Bars3CenterLeftIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';
import FavoriteButton from '@/components/campaign/FavoriteButton';
import styles from '@/components/campaign/CampaignCard.module.css';

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
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites?page=${page}&limit=${ITEMS_PER_PAGE}`,
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
        <div className="w-full">
            <div className="mb-2 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                    <HeartIcon className="w-5 h-5 sm:w-8 sm:h-8 text-pink-500" />
                    My Favorites
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 ml-7 sm:ml-9">
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
                    <div className="space-y-[2vw] mb-[2vw]">
                        {campaigns.map((campaign) => (
                            <Link
                                key={campaign.id}
                                href={`/home/${campaign.id}`}
                                className="block group [container-type:inline-size] [container-name:hcard] md:aspect-[3.5/1] aspect-auto"
                            >
                                <div className="flex w-full h-full overflow-hidden bg-white rounded-[5cqi] md:rounded-[3.5cqi] border-[1.5px] border-[#e3e9f1] transition-all hover:border-cyan-400 md:flex-row flex-col">
                                    {/* Image Section */}
                                    <div className="h-full shrink-0 flex items-center md:w-[28cqi] md:min-w-[28cqi] md:p-[1.5cqi] w-full p-0">
                                        <div className="relative w-full overflow-hidden md:aspect-square aspect-[3/2] md:rounded-[2cqi] rounded-t-[5cqi] rounded-b-0">
                                            {campaign.coverImageUrl ? (
                                                <img
                                                    src={campaign.coverImageUrl}
                                                    alt={campaign.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100">
                                                    <Bars3CenterLeftIcon className="md:w-[8cqi] md:h-[8cqi] w-[12cqi] h-[12cqi] text-pink-300" />
                                                </div>
                                            )}
                                            {/* Badges */}
                                            <span className="absolute md:top-[1cqi] md:left-[1cqi] top-[3cqi] left-[3cqi] md:px-[1.4cqi] md:py-[0.4cqi] px-[3cqi] py-[1.5cqi] md:text-[1.3cqi] text-[3.5cqi] font-bold bg-white/90 text-black shadow-sm capitalize rounded-full">
                                                {campaign.category}
                                            </span>
                                            <span className={`absolute md:top-[1cqi] md:right-[1cqi] top-[3cqi] right-[3cqi] md:px-[1.4cqi] md:py-[0.4cqi] px-[3cqi] py-[1.5cqi] md:text-[1.3cqi] text-[3.5cqi] font-bold uppercase shadow-sm rounded-full ${campaign.status === 'ACTIVE'
                                                ? 'bg-green-100/90 text-green-700'
                                                : 'bg-yellow-100/90 text-yellow-700'
                                                }`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden md:p-[1.8cqi_3cqi_2cqi] p-[4.5cqi]">
                                        <div>
                                            <h2 className="font-extrabold text-gray-900 overflow-hidden text-ellipsis md:text-[2.4cqi] text-[6.8cqi] md:mb-[0.5cqi] mb-[2.5cqi] leading-[1.3]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {campaign.title}
                                            </h2>

                                            {campaign.locationText && (
                                                <div className="flex items-center text-gray-400 gap-[1.5cqi] md:gap-[0.5cqi] md:text-[1.4cqi] text-[4cqi] md:mb-[0.5cqi] mb-[2.5cqi]">
                                                    <MapPinIcon className="shrink-0 md:w-[1.6cqi] md:h-[1.6cqi] w-[4.5cqi] h-[4.5cqi]" />
                                                    <span>{campaign.locationText}</span>
                                                </div>
                                            )}

                                            <p className="font-bold text-slate-700 md:text-[1.8cqi] text-[6cqi] md:mt-[0.5cqi] mt-[2.5cqi] leading-[1.5]">
                                                Goal: <span className="font-black text-[#14ABD1]">{formatCurrency(campaign.fundingGoalAmount)} VND</span>
                                            </p>
                                            <p className="font-bold text-gray-400 uppercase md:text-[1.2cqi] text-[4cqi] md:mt-[0.2cqi] mt-[1cqi]">
                                                Min Donation: <span className="font-bold text-gray-600">{formatCurrency(campaign.minimumDonationAmount)} VND</span>
                                            </p>

                                            <div className="flex items-center text-gray-400 gap-[1.5cqi] md:gap-[0.5cqi] md:text-[1.4cqi] text-[4cqi] md:mt-[0.8cqi] mt-[3cqi]">
                                                <CalendarIcon className="text-gray-400 shrink-0 md:w-[1.6cqi] md:h-[1.6cqi] w-[4.5cqi] h-[4.5cqi]" />
                                                <span>Ngày lưu: <span className="font-medium text-gray-700">{formatDate(campaign.favoritedAt)}</span></span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-[1.5cqi] md:gap-[1cqi] md:mt-[1cqi] mt-[5cqi] flex-wrap">
                                            <FavoriteButton
                                                campaignId={campaign.id}
                                                initialFavorited={true}
                                                onToggle={handleToggleFavorite}
                                                className="md:min-w-[14cqi] flex-1 md:flex-none px-[3cqi] py-[2.2cqi] md:px-[1cqi] md:py-[0.7cqi] md:text-[1.3cqi] text-[4cqi]"
                                            />
                                            <span className="md:min-w-[14cqi] flex-1 md:flex-none px-[3cqi] py-[2.2cqi] md:px-[1cqi] md:py-[0.7cqi] md:text-[1.3cqi] text-[4cqi] font-bold border-2 border-yellow-400 bg-white text-yellow-600 cursor-pointer text-center inline-flex items-center justify-center whitespace-nowrap hover:bg-[#FFF9E0] rounded-full transition-all">
                                                Xem &amp; Ủng Hộ
                                            </span>
                                        </div>
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
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Chưa có chiến dịch nào được yêu thích</h2>
                    <p className="text-gray-500 mb-6">Hãy bắt đầu với 1 chiến dịch ngay bay giờ nhé.</p>
                    <Link href="/list" className="px-8 py-3 bg-pink-500 text-white font-bold rounded-full shadow-lg shadow-pink-200 hover:scale-105 transition-all inline-block">
                        Khám phá ngay
                    </Link>
                </div>
            )}
        </div>
    );
}