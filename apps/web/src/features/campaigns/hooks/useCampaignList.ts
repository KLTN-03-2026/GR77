'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchPublicCampaigns, fetchCategories } from '../services/campaignService';
import type { PublicCampaign, CategoryOption, CampaignListFilter } from '../types/campaign';

interface UseCampaignListOptions {
  /** Number of items per page (default: 12) */
  itemsPerPage?: number;
}

export function useCampaignList(options: UseCampaignListOptions = {}) {
  const { itemsPerPage = 12 } = options;

  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<CampaignListFilter>({
    search: '',
    category: 'All',
    status: 'All',
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => { });
  }, []);

  // Fetch all campaigns once
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    fetchPublicCampaigns({
      status: 'All',
      limit: 100,
    })
      .then((data) => {
        if (!cancelled) {
          setCampaigns(data.items || []);
          setCurrentPage(1);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Something went wrong');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (filter.category !== 'All') {
        const catName = c.categoryRel?.name ?? c.category;
        if (catName !== filter.category) return false;
      }
      if (filter.search.trim()) {
        const lowerQ = filter.search.toLowerCase();
        if (!c.title.toLowerCase().includes(lowerQ)) return false;
      }
      return true;
    });
  }, [campaigns, filter.search, filter.category]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(start, start + itemsPerPage);
  }, [filteredCampaigns, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / itemsPerPage));

  const updateFilter = useCallback((patch: Partial<CampaignListFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
    setCurrentPage(1);
  }, []);

  return {
    campaigns: filteredCampaigns,
    paginated,
    categories,
    filter,
    updateFilter,
    isLoading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
  };
}

