'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface CategoryOption {
    id: string;
    name: string;
}

const ITEMS_PER_PAGE = 10;

export function useCampaigns() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('q') || '';

    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState(initialSearch);
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/categories`)
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

                const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns?${params.toString()}`, {
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
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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

    return {
        currentPage,
        search,
        selectedCategory,
        startDateFilter,
        endDateFilter,
        categories,
        isLoading,
        error,
        filtered,
        paginated,
        totalPages,
        favoriteIds,
        setSearch: handleSearch,
        setSelectedCategory,
        setStartDateFilter,
        setEndDateFilter,
        handlePageChange,
        handleFavoriteToggle,
        setCurrentPage,
    };
}
