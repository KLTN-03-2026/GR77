'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { CalendarIcon, MagnifyingGlassIcon, Bars3CenterLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import FavoriteButton from '@/components/campaign/FavoriteButton';

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

interface CategoryOption {
    id: string;
    name: string;
}

export default function ListCampaignsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalFromApi, setTotalFromApi] = useState(0);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [categories, setCategories] = useState<CategoryOption[]>([]);

    // Fetch dynamic categories
    useEffect(() => {
        fetch('http://localhost:3001/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to load categories:', err));
    }, []);

    // Fetch campaigns
    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                params.set('page', '1');
                params.set('limit', '100'); // Fetch all for client-side filtering

                if (selectedCategory !== 'All') {
                    params.set('category', selectedCategory);
                }
                if (search) {
                    params.set('q', search);
                }

                const token = localStorage.getItem('accessToken');
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`http://localhost:3001/campaigns?${params.toString()}`, {
                    headers,
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch campaigns');
                }

                const data = await res.json();
                setCampaigns(data.items || []);
                setTotalFromApi(data.meta?.total || 0);

                // Populate favoriteIds from the isFavorited field in campaigns
                if (token) {
                    const ids = new Set<string>(
                        (data.items || [])
                            .filter((c: any) => c.isFavorited)
                            .map((c: any) => c.id)
                    );
                    setFavoriteIds(ids);
                }
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message || 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, [search, selectedCategory]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount: number | string) => {
        return Number(amount).toLocaleString('vi-VN');
    };

    // Client-side date filtering
    const filtered = useMemo(() => {
        return campaigns.filter((c) => {
            const matchDate = (() => {
                if (!startDateFilter && !endDateFilter) return true;
                const campaignDate = c.startAt ? new Date(c.startAt).getTime() : 0;
                const start = startDateFilter ? new Date(startDateFilter).getTime() : 0;
                const end = endDateFilter ? new Date(endDateFilter).getTime() + 86400000 : Infinity;
                return campaignDate >= start && campaignDate <= end;
            })();

            return matchDate;
        });
    }, [campaigns, startDateFilter, endDateFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        setCurrentPage(1);
    };

    const handleFavoriteToggle = useCallback((campaignId: string, nowFavorited: boolean) => {
        setFavoriteIds(prev => {
            const next = new Set(prev);
            if (nowFavorited) next.add(campaignId);
            else next.delete(campaignId);
            return next;
        });
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, favoritesCount: (c.favoritesCount || 0) + (nowFavorited ? 1 : -1) } : c));
    }, []);

    const getProgress = (raised: number, goal: number) => {
        if (!goal || goal === 0) return 0;
        return Math.min((raised / goal) * 100, 100);
    };

    return (
        <div className="w-full">
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Bars3CenterLeftIcon className="w-7 h-7 text-cyan-500" />
                    List Campaigns
                </h1>
                <p className="text-sm text-gray-400 mt-1 ml-9">Explore and support active campaigns</p>
            </div>

            {/* Search + filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

                <div className="flex gap-2 relative overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                    <div className="flex items-center bg-white border border-gray-200 rounded-full px-2 py-1 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-200 transition-all">
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
                            className="px-2 py-1 text-sm font-medium text-gray-600 outline-none bg-transparent cursor-pointer"
                        />
                        <span className="text-gray-400 text-xs px-1">-</span>
                        <input
                            type="date"
                            value={endDateFilter}
                            onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
                            className="px-2 py-1 text-sm font-medium text-gray-600 outline-none bg-transparent cursor-pointer"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                        className="px-6 py-2.5 rounded-full text-sm font-bold bg-white text-gray-800 border-2 border-gray-100 hover:border-gray-200 hover:text-black transition-all min-w-[160px] outline-none cursor-pointer appearance-none shadow-sm"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23000000\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right .8rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2.5rem' }}
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
                Showing {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
                {search ? ` matching "${search}"` : ''}
            </p>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center py-24 mb-14 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
                    <p className="text-gray-400 font-medium text-sm">Loading campaigns...</p>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center py-24 mb-14 text-red-500 font-medium text-lg border-2 border-dashed border-red-200 rounded-2xl bg-red-50">
                    {error}
                </div>
            ) : paginated.length > 0 ? (
                <>
                    <div className="space-y-6 mb-8">
                        {paginated.map((campaign) => {
                            const progress = getProgress(0, Number(campaign.fundingGoalAmount));
                            return (
                                <Link
                                    key={campaign.id}
                                    href={`/home/${campaign.id}`}
                                    className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:border-cyan-400 hover:ring-2 hover:ring-cyan-100 transition-all group block shadow-sm"
                                >
                                    <div className="w-full md:w-[35%] p-4 h-56 md:h-auto relative">
                                        <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                                            {campaign.coverImageUrl ? (
                                                <img
                                                    src={campaign.coverImageUrl}
                                                    alt={campaign.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                                                    <Bars3CenterLeftIcon className="w-16 h-16 text-cyan-300" />
                                                </div>
                                            )}
                                            <span className="absolute top-3 left-3 bg-white/90 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                {campaign.categoryRel?.name || campaign.category}
                                            </span>
                                            <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${campaign.status === 'ACTIVE' ? 'bg-green-100/90 text-green-600' : 'bg-yellow-100/90 text-yellow-600'}`}>
                                                {campaign.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-black transition-colors uppercase tracking-tight">
                                                {campaign.title}
                                            </h2>
                                            {campaign.locationText && (
                                                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                                                    <MapPinIcon className="w-4 h-4" />
                                                    <span>{campaign.locationText}</span>
                                                </div>
                                            )}
                                            <p className="text-lg font-bold text-slate-700 mb-1">
                                                Goal: <span className="text-black font-black">{formatCurrency(campaign.fundingGoalAmount)} VND</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mb-4 font-bold uppercase tracking-widest">
                                                Min: {formatCurrency(campaign.minimumDonationAmount)} VND
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                    <span className="font-bold">{formatDate(campaign.startAt)}</span>
                                                    <span className="text-gray-300 mx-1">→</span>
                                                    <span className="font-bold">{formatDate(campaign.endAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                                <HeartIcon className="w-4 h-4 text-pink-400" />
                                                <span className="font-bold">{campaign.favoritesCount || 0} favorites</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-center mt-6">
                                            <span className="flex-1 md:flex-none px-12 py-3 bg-black text-white font-black uppercase tracking-widest rounded-full shadow-lg shadow-gray-100 text-center text-xs hover:bg-gray-900 transition-all">
                                                View Details
                                            </span>
                                            <FavoriteButton
                                                campaignId={campaign.id}
                                                initialFavorited={favoriteIds.has(campaign.id)}
                                                onToggle={handleFavoriteToggle}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

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
                                    <span key={idx} className="px-2 text-gray-400">{item}</span>
                                )
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-gray-100 border-dashed">
                    <Bars3CenterLeftIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-500 mb-2 uppercase tracking-tight">No campaigns found</h2>
                    <p className="text-gray-400 font-medium">Try adjusting your search or filter.</p>
                </div>
            )}
        </div>
    );
}
