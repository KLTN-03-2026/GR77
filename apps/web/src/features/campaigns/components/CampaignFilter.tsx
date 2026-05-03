'use client';

import React from 'react';
import type { CategoryOption, CampaignListFilter } from '../types/campaign';

const DROPDOWN_ARROW = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`;

const SELECT_CLASS =
  'h-[34px] px-3 pr-7 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:border-blue-300 transition-all outline-none cursor-pointer appearance-none shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

const SELECT_STYLE: React.CSSProperties = {
  backgroundImage: DROPDOWN_ARROW,
  backgroundPosition: 'right .4rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '0.85em 0.85em',
  paddingRight: '1.6rem',
};

interface CampaignFilterProps {
  filter: CampaignListFilter;
  categories: CategoryOption[];
  onFilterChange: (patch: Partial<CampaignListFilter>) => void;
  totalCount: number;
}

export default function CampaignFilter({
  filter,
  categories,
  onFilterChange,
  totalCount,
}: CampaignFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full max-w-2xl">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          id="campaign-search"
          type="text"
          placeholder="Search campaigns..."
          value={filter.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full h-[34px] pl-8 pr-8 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
        />
        {filter.search && (
          <button
            onClick={() => onFilterChange({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdowns row */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Category */}
        <select
          value={filter.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className={SELECT_CLASS}
          style={SELECT_STYLE}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
      
    {/* Count */}
      <span className="hidden sm:block text-[13px] font-bold text-gray-400 whitespace-nowrap sm:ml-auto">
        Total: {totalCount} campaigns
      </span>
    </div>
  );
}
