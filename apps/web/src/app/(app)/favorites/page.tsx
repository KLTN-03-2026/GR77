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
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <HeartIcon className="w-8 h-8 text-pink-500" />
                            Favorite Campaigns
                        </h1>
                    </div>

                    {favoriteCampaigns.length > 0 ? (
                        <>
                            <div className="space-y-6 mb-8">
                                {paginatedCampaigns.map((campaign) => (
                                    <div
                                        key={campaign.id}
                                        className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="w-full md:w-[35%] p-4 h-56 md:h-auto">
                                            <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                                                <img
                                                    src={campaign.image}
                                                    alt={campaign.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                                    {campaign.title}
                                                </h2>
                                                <p className="text-lg font-semibold text-gray-600 mb-6 italic">
                                                    Amount Raised <span className="text-pink-500 not-italic">${campaign.amountRaised.toLocaleString()}</span>
                                                </p>

                                                <div className="relative max-w-xs mb-6 group/input">
                                                    <input
                                                        type="date"
                                                        defaultValue={campaign.endDate || campaign.startDate}
                                                        className="w-full p-3 pr-10 border border-gray-200 rounded-2xl text-sm bg-gray-50/30 outline-none focus:border-blue-400 cursor-pointer text-gray-500 font-medium transition-all"
                                                    />
                                                    <CalendarIcon className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover/input:text-blue-500 transition-colors" />
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    //onClick={() => handleToggleFavorite(campaign.id)}
                                                    className="flex-1 md:flex-none px-10 py-3 bg-[#FF69B4] text-white font-bold rounded-full shadow-lg shadow-pink-100 active:scale-95 transition-all"
                                                >
                                                    Save
                                                </button>
                                                <button className="flex-1 md:flex-none px-10 py-3 bg-white border-2 border-[#FFD700] text-gray-800 font-bold rounded-full active:scale-95 transition-all hover:bg-yellow-50">
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 0 && (
                                <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
                                    {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                                        typeof item === 'number' ? (
                                            <button
                                                key={idx}
                                                onClick={() => handlePageChange(item)}
                                                className={`
                                            w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all
                                            ${currentPage === item
                                                        ? "bg-cyan-400 text-white shadow-lg shadow-cyan-100 scale-110" : "border border-gray-100 text-gray-400 hover:bg-gray-50"
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
            </div>
        </div>
    );
}