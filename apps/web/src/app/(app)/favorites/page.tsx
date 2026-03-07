'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/Button';
import { HeartIcon } from '@heroicons/react/24/solid';
import { mockCampaigns } from '@/lib/mock';
import { CalendarIcon } from '@heroicons/react/24/outline';


//phan trang
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
    for (let i of range) {
        if (last !== undefined && typeof i === 'number' && i - last > 1) {
            rangeWithDots.push('...');
        }
        rangeWithDots.push(i);
        if (typeof i === 'number') last = i;
    }
    return rangeWithDots;
}

const ITEMS_PER_PAGE = 9;

export default function FavoritesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [favorites, setFavorites] = useState(mockCampaigns);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    //Lọc các favorite Campaigns
    const favoriteCampaigns = useMemo(() => {
        return favorites.filter(campaign => campaign.isFavorite);
    }, [favorites]);

    //Tính toán phân trang
    const totalPages = Math.ceil(favoriteCampaigns.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCampaigns = favoriteCampaigns.slice(startIndex, endIndex);

    const handleToggleFavorite = (id: string) => {
        setFavorites(favorites.map(campaign =>
            campaign.id === id
                ? { ...campaign, isFavorite: !campaign.isFavorite }
                : campaign
        ));
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <HeartIcon className="w-8 h-8 text-pink-500" />
                    Favorite Campaigns
                </h1>
            </div>

            {favoriteCampaigns.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {paginatedCampaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="h-48 overflow-hidden bg-gray-100">
                                    <img
                                        src={campaign.image}
                                        alt={campaign.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                                        {campaign.title}
                                    </h2>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-sm text-gray-600">Amount Raised</span>
                                            <span className="font-bold text-gray-900">
                                                ${campaign.amountRaised.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                            <span>{formatDate(campaign.endDate || campaign.startDate)}</span>
                                            <CalendarIcon className="h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-center mt-4">
                                        <button
                                            onClick={() => handleToggleFavorite(campaign.id)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                        >
                                            <HeartIcon className="w-4 h-4" />
                                            Save
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 border-2 border-yellow-400 hover:bg-yellow-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                                            <img
                                                src="/images/favorites/join.svg"
                                                alt="Add user group"
                                                className="w-6 h-6"
                                            />
                                            Join
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
                            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                                typeof item === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(item)}
                                        className={`
                                            w-10 h-10 rounded-full font-medium transition-all
                                            ${currentPage === item
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-500 hover:text-blue-500'
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
                //Hthị khi k có favorite campaigns
                <div className="text-center py-12">
                    <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">No Favorites Yet</h2>
                    <p className="text-gray-500">Start adding campaigns to your favorites!</p>
                </div>
            )}
        </div>
    );
}
