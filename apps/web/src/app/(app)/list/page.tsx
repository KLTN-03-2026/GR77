'use client';

import { useState, useMemo } from 'react';
import { mockCampaigns } from '@/lib/mock';
import { CalendarIcon, MagnifyingGlassIcon, Bars3CenterLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

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

const ITEMS_PER_PAGE = 4;

const CATEGORIES = ['All', 'Education', 'Healthcare', 'Community', 'Environment', 'Animals'];

export default function ListCampaignsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [campaigns, setCampaigns] = useState(mockCampaigns);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filtered = useMemo(() => {
        return campaigns.filter((c) => {
            const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());

            const matchDate = (() => {
                if (!startDateFilter && !endDateFilter) return true;
                const campaignDate = c.startDate ? new Date(c.startDate).getTime() : 0;
                const start = startDateFilter ? new Date(startDateFilter).getTime() : 0;
                const end = endDateFilter ? new Date(endDateFilter).getTime() + 86400000 : Infinity;
                return campaignDate >= start && campaignDate <= end;
            })();

            const matchCat = selectedCategory === 'All' || c.category === selectedCategory;

            return matchSearch && matchDate && matchCat;
        });
    }, [campaigns, search, startDateFilter, endDateFilter, selectedCategory]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleToggleFavorite = (id: string) => {
        setCampaigns((prev) =>
            prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
        );
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        setCurrentPage(1);
    };



    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <div className="max-w-5xl mx-auto">

                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bars3CenterLeftIcon className="w-7 h-7 text-cyan-500" />
                        List campaigns
                    </h1>
                </div>

                {/* Search + filter bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search */}
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-500 bg-gray-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 relative overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                        {/* Date Range Filter */}
                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-2 py-1 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-200 transition-all">
                            <input
                                type="date"
                                value={startDateFilter}
                                onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
                                className="px-2 py-1 text-sm font-medium text-gray-600 outline-none bg-transparent cursor-pointer"
                                title="Start Date"
                            />
                            <span className="text-gray-400 text-xs px-1">-</span>
                            <input
                                type="date"
                                value={endDateFilter}
                                onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
                                className="px-2 py-1 text-sm font-medium text-gray-600 outline-none bg-transparent cursor-pointer"
                                title="End Date"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                            className="px-4 py-2.5 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:border-cyan-300 hover:text-cyan-500 transition-all min-w-[140px] outline-none cursor-pointer appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right .5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat === 'All' ? 'Category Setup' : cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <p className="text-sm text-gray-500 mb-4">
                    Showing {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
                    {search ? ` matching "${search}"` : ''}
                </p>

                {/* Campaign list */}
                {paginated.length > 0 ? (
                    <>
                        <div className="space-y-6 mb-8">
                            {paginated.map((campaign) => {
                                return (
                                    <div
                                        key={campaign.id}
                                        className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:border-cyan-400 hover:ring-2 hover:ring-cyan-100 transition-all group"
                                    >
                                        {/* Image */}
                                        <div className="w-full md:w-[35%] p-4 h-56 md:h-auto relative">
                                            <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                                                <img
                                                    src={campaign.image}
                                                    alt={campaign.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                {/* Category badge */}
                                                <span className="absolute top-3 left-3 bg-white/90 text-cyan-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                                    {campaign.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                                    {campaign.title}
                                                </h2>
                                                <p className="text-lg font-bold text-slate-700 mb-3 italic">
                                                    Amount Raised{' '}
                                                    <span className="text-pink-500 font-bold not-italic">
                                                        ${campaign.amountRaised.toLocaleString()}
                                                    </span>
                                                </p>
                                                {/* Date picker */}
                                                <div className="relative max-w-xs mb-6 group/input">
                                                    <input
                                                        type="date"
                                                        defaultValue={campaign.endDate || campaign.startDate}
                                                        className="w-full p-3 pr-10 border border-gray-200 rounded-2xl text-sm bg-gray-50/30 outline-none focus:border-blue-400 cursor-pointer text-gray-500 font-medium transition-all"
                                                    />
                                                    <CalendarIcon className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover/input:text-blue-500 transition-colors" />
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-4 items-center">
                                                <button
                                                    onClick={() => handleToggleFavorite(campaign.id)}
                                                    className="flex-1 md:flex-none px-10 py-3 bg-[#FF69B4] text-white font-bold rounded-full shadow-lg shadow-pink-100 active:scale-95 transition-all"
                                                >
                                                    Save
                                                </button>
                                                <button className="flex-1 md:flex-none px-8 py-3 bg-white border-2 border-[#FFD700] text-gray-800 font-bold rounded-full active:scale-95 transition-all hover:bg-yellow-50">
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
                                {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                                    typeof item === 'number' ? (
                                        <button
                                            key={idx}
                                            onClick={() => handlePageChange(item)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === item
                                                ? 'bg-cyan-400 text-white shadow-lg shadow-cyan-100 scale-110'
                                                : 'border border-gray-100 text-gray-400 hover:bg-gray-50'
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    ) : (
                                        <span key={idx} className="px-2 text-gray-400">
                                            {item}
                                        </span>
                                    )
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty state */
                    <div className="text-center py-20">
                        <Bars3CenterLeftIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-500 mb-2">No campaigns found</h2>
                        <p className="text-gray-400">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
