'use client';

import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

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

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                typeof item === 'number' ? (
                    <button
                        key={idx}
                        onClick={() => onPageChange(item)}
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
    );
}
