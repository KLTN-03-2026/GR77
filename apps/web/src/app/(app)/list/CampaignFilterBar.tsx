'use client';

import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-1.5 sm:mb-6">
            <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full h-[25px] sm:h-[35px] pl-8 sm:pl-10 pr-3 sm:pr-4 border border-gray-200 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-medium text-gray-900 placeholder-gray-400 bg-gray-50 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
                />
            </div>

            <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto flex-nowrap items-center">
                <div className="flex-1 sm:flex-none h-[25px] sm:h-[35px] flex items-center justify-between bg-white border border-gray-200 rounded-full px-1.5 sm:px-2 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-200 transition-all min-w-0">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="flex-1 sm:flex-none w-full sm:w-auto px-0.5 sm:px-2 text-[10px] sm:text-sm font-medium text-gray-600 outline-none bg-transparent cursor-pointer text-center min-w-0"
                    />
                    <span className="text-gray-300 text-[9px] sm:text-xs shrink-0 mx-0.5">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="flex-1 sm:flex-none w-full sm:w-auto px-0.5 sm:px-2 text-[10px] sm:text-sm font-medium text-gray-600 outline-none bg-transparent cursor-pointer text-center min-w-0"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="shrink-0 w-[100px] sm:w-auto h-[25px] sm:h-[35px] px-2 sm:px-6 rounded-full text-[10px] sm:text-sm font-bold bg-white text-gray-800 border-2 border-gray-100 hover:border-gray-200 hover:text-black transition-all outline-none cursor-pointer appearance-none shadow-sm text-center"
                    style={{
                        backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23000000\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")',
                        backgroundPosition: 'right .3rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1em 1em',
                        paddingRight: '1.2rem'
                    }}
                >
                    <option value="All">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
