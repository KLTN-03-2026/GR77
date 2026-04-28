'use client';

import React from 'react';
import { MagnifyingGlassIcon, CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface CampaignFilterBarProps {
    search: string;
    onSearchChange: (val: string) => void;
    startDate: string;
    onStartDateChange: (val: string) => void;
    endDate: string;
    onEndDateChange: (val: string) => void;
    selectedCategory: string;
    onCategoryChange: (val: string) => void;
    categories: { id: string; name: string }[];
}

const BRAND_COLOR = '#0891B2';

export default function CampaignFilterBar({
    search,
    onSearchChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    selectedCategory,
    onCategoryChange,
    categories,
}: CampaignFilterBarProps) {
    return (
        <div className="bg-[#0891B2]/6 p-4 sm:p-5 mb-8">
            <div className="flex flex-col md:flex-row items-end gap-4 md:gap-6">
                {/* Search */}
                <div className="flex-1 w-full">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#056C85] mb-1.5 ml-1 opacity-80">
                        Search Campaigns
                    </label>
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500 stroke-2 group-focus-within:text-[#0891B2] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-11 pr-4 py-1.5 bg-gray-50 border-2 border-gray-300 rounded-2xl text-[14px] text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Date Range */}
                <div className="w-full md:w-auto">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#056C85] mb-1.5 ml-1 opacity-80">
                        Date Range
                    </label>
                    <div className="flex items-center bg-gray-50 border-2 border-gray-300 rounded-2xl py-1.5 px-4 group focus-within:ring-1 focus-within:ring-cyan-500 outline-none transition-all">
                        <CalendarIcon className="w-[18px] h-[18px] text-gray-500 stroke-2 group-focus-within:text-[#0891B2] transition-colors shrink-0" />
                        <div className="flex items-center ml-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                                className="w-[110px] bg-transparent border-none outline-none text-[14px] text-gray-900 placeholder-gray-400 cursor-pointer"
                            />
                            <span className="mx-1 text-gray-400">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                                className="w-[110px] bg-transparent border-none outline-none text-[14px] text-gray-900 placeholder-gray-400 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Category */}
                <div className="w-full md:w-[220px]">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-[#056C85] mb-1.5 ml-1 opacity-80">
                        Category
                    </label>
                    <div className="relative group">
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="w-full py-1.5 px-5 bg-gray-50 border-2 border-gray-300 rounded-2xl text-[14px] text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="All">All Initiatives</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#0891B2] pointer-events-none transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
}
