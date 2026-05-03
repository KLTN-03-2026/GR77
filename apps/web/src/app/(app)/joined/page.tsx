'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { UserGroupIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Bars3CenterLeftIcon, MapPinIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;
const TEAL = '#0891B2';

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

export default function JoinedCampaignsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Fetch categories
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/categories`)
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Failed to load categories:', err));
    }, []);

    const fetchJoinedCampaigns = useCallback(async (page: number) => {
        setIsLoading(true);
        setError('');
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            setError('Please log in to view joined campaigns.');
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/participants/me?page=${page}&limit=${ITEMS_PER_PAGE}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                if (res.status === 401) throw new Error('Session expired.');
                throw new Error('Error loading joined campaigns.');
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
        fetchJoinedCampaigns(currentPage);
    }, [currentPage, fetchJoinedCampaigns]);

    const filteredCampaigns = useMemo(() => {
        if (!Array.isArray(campaigns)) return [];
        return campaigns.filter((c) => {
            if (!c) return false;
            const matchesSearch = (c.title || '').toLowerCase().includes((searchQuery || '').toLowerCase());
            const matchesCategory = selectedCategory === 'All' ||
                (c.categoryRel?.name === selectedCategory) ||
                (c.category === selectedCategory);
            return matchesSearch && matchesCategory;
        });
    }, [campaigns, searchQuery, selectedCategory]);

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return '';
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDate(dateString);
    };

    return (
        <div className="w-full">
            <div className="mb-4 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                    <UserGroupIcon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: TEAL }} />
                    Joined Campaigns
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 ml-7 sm:ml-9">Campaigns you have joined will appear here.</p>
            </div>

            {/* Search + Category Filter */}
            <div className="bg-[#0891B2]/5 p-4 sm:p-5 mb-6 ">
                <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
                    <div className="flex-1">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-[#056C85] mb-1.5 ml-1 opacity-80">
                            Search Joined
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="w-[18px] h-[18px] text-gray-500 stroke-2" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search joined campaigns"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-1.5 bg-white border-2 border-gray-300 rounded-2xl text-[14px] text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-[220px]">
                        <label className="block text-[11px] font-black uppercase tracking-widest text-[#056C85] mb-1.5 ml-1 opacity-80">
                            Category
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full py-1.5 px-4 bg-white border-2 border-gray-300 rounded-2xl text-[14px] text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#0891B2] pointer-events-none transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] sm:text-sm text-gray-500 mb-2 sm:mb-4 px-1">
                Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center py-24 mb-14 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: TEAL }}></div>
                    <p className="text-gray-400 font-medium text-sm">Loading joined campaigns...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col justify-center items-center py-24 mb-14 border-2 border-dashed border-red-200 rounded-2xl bg-red-50 text-red-500 font-medium p-4 text-center">
                    <p className="mb-4">{error}</p>
                    <Link href="/login" className="px-6 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors">
                        Go to Login
                    </Link>
                </div>
            ) : campaigns.length > 0 ? (
                <>
                    {filteredCampaigns.length > 0 ? (
                        <div className="flex flex-col gap-5 sm:gap-6 mb-8">
                            {filteredCampaigns.map((campaign) => (
                                <div
                                    key={campaign.participantId || campaign.id}
                                    className="group [container-type:inline-size] [container-name:acard] md:aspect-[5.1/1] aspect-auto overflow-hidden bg-white rounded-[3cqi] md:rounded-[1cqi] border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="flex w-full h-full overflow-hidden md:flex-row flex-col">
                                        {/* ── Image ── */}
                                        <div className="relative shrink-0 md:w-[29cqi] w-full overflow-hidden">
                                            <div className="w-full h-full aspect-[2.2/1] md:aspect-auto">
                                                {campaign.coverImageUrl ? (
                                                    <img
                                                        src={campaign.coverImageUrl}
                                                        alt={campaign.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D4F4F 0%, #115E59 100%)' }}>
                                                        <Bars3CenterLeftIcon className="md:w-[8cqi] md:h-[8cqi] w-12 h-12 text-white/30" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Status + Category badges stacked top-left */}
                                            <div className="absolute md:top-[1cqi] md:left-[1cqi] top-3 left-3 flex flex-col md:gap-[0.5cqi] gap-1">
                                                <span
                                                    className={`md:px-[1.2cqi] md:py-[0.4cqi] px-3 py-1 md:text-[1cqi] text-[10px] font-extrabold uppercase tracking-wider rounded-full w-fit ${campaign.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                                                        }`}
                                                >
                                                    {campaign.status}
                                                </span>
                                                <span className="md:px-[1.2cqi] md:py-[0.4cqi] px-3 py-1 md:text-[1cqi] text-[10px] font-bold bg-white/90 text-gray-800 shadow-sm capitalize rounded-full w-fit">
                                                    {campaign.categoryRel?.name || campaign.category || 'General'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ── Content ── */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden md:p-[1.3cqi_2.5cqi_1.6cqi] p-4">
                                            <div>
                                                {/* Top row: title */}
                                                <div className="flex items-center md:h-[4.4cqi] h-[44px] md:mb-[1cqi] mb-1">
                                                    <h2 className="font-bold md:text-[1.8cqi] text-base text-gray-900 leading-snug overflow-hidden text-ellipsis w-full" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {campaign.title}
                                                    </h2>
                                                </div>

                                                {/* Location */}
                                                {campaign.locationText && (
                                                    <div className="flex items-center md:gap-[0.5cqi] gap-1 text-gray-500 md:text-[1.2cqi] text-xs md:mb-[0.6cqi] mb-2">
                                                        <MapPinIcon className="shrink-0 md:w-[1.4cqi] md:h-[1.4cqi] w-3.5 h-3.5" style={{ color: TEAL }} />
                                                        <span className="truncate">{campaign.locationText}</span>
                                                    </div>
                                                )}
                                                {/* Timeline */}
                                                <div className="md:mb-[0.8cqi] mb-2">
                                                    <p className="md:text-[1.3cqi] text-xs font-medium flex text-gray-500 items-center gap-1">
                                                        <CalendarDaysIcon className="shrink-0 md:w-[1.4cqi] md:h-[1.4cqi] w-3.5 h-3.5" style={{ color: TEAL }} />
                                                        {formatDate(campaign.startAt)} – {formatDate(campaign.endAt)}
                                                    </p>
                                                </div>
                                                {/* Joined date */}
                                                <div className="md:mb-[0.5cqi] mb-1.5">
                                                    <p className="md:text-[1.2cqi] text-xs font-medium flex text-gray-400 items-center gap-1 italic">
                                                        <ClockIcon className="shrink-0 md:w-[1.3cqi] md:h-[1.3cqi] w-3.5 h-3.5" style={{ color: TEAL }} />
                                                        Joined: {campaign.joinedAt ? new Date(campaign.joinedAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Bottom row: button */}
                                            <div className="flex md:flex-row flex-col md:items-center justify-end mt-auto md:pt-[1.2cqi] pt-2 border-t border-gray-200 md:gap-[1.5cqi] gap-3">
                                                <div className="flex items-stretch md:gap-[1cqi] gap-2 w-full md:w-auto">
                                                    <Link
                                                        href={`/joined/${campaign.id}`}
                                                        className="inline-flex items-center justify-center flex-1 md:flex-none md:w-[13cqi] md:h-[3.5cqi] md:px-[1cqi] md:py-[0.5cqi] md:text-[1.3cqi] h-9 text-xs font-bold bg-white rounded-full border-2 shadow-sm transition-all duration-200 active:scale-95"
                                                        style={{
                                                            color: TEAL,
                                                            borderColor: TEAL
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = TEAL;
                                                            e.currentTarget.style.color = '#fff';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#fff';
                                                            e.currentTarget.style.color = TEAL;
                                                        }}
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-gray-100 border-dashed mb-10">
                            <Bars3CenterLeftIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-500 mb-2 uppercase tracking-tight">No campaigns found</h2>
                            <p className="text-gray-400 font-medium">Try adjusting your search or filter.</p>
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-1.5 mb-8">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>

                            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                                typeof item === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(item)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all"
                                        style={
                                            currentPage === item
                                                ? { backgroundColor: TEAL, color: '#fff' }
                                                : { color: '#6B7280' }
                                        }
                                        onMouseEnter={(e) => {
                                            if (currentPage !== item) {
                                                e.currentTarget.style.backgroundColor = '#F3F4F6';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== item) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {item}
                                    </button>
                                ) : (
                                    <span key={idx} className="px-1 text-gray-400 text-sm">…</span>
                                )
                            )}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                    <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">No joined campaigns</h2>
                    <p className="text-gray-500 mb-6">You haven't joined any campaigns yet.</p>
                    <Link
                        href="/list"
                        className="px-8 py-3 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all inline-block"
                        style={{ backgroundColor: TEAL }}
                    >
                        Explore Campaigns
                    </Link>
                </div>
            )}
        </div>
    );
}