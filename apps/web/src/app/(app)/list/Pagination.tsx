'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const TEAL = '#0891B2';

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
        <div className="flex justify-center items-center gap-1.5 mb-8">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
            >
                <ChevronLeftIcon className="w-4 h-4" />
            </button>

            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                typeof item === 'number' ? (
                    <button
                        key={idx}
                        onClick={() => onPageChange(item)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold"
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
                onClick={() => onPageChange(currentPage + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"
            >
                <ChevronRightIcon className="w-4 h-4" />
            </button>
        </div>
    );
}
