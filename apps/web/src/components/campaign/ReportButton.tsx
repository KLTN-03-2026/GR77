'use client';

import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ReportButtonProps {
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}

/**
 * ReportButton – A button with an exclamation icon to trigger reports
 */
export default function ReportButton({
    onClick,
    className = '',
}: ReportButtonProps) {
    return (
        <button
            onClick={onClick}
            aria-label="Report Campaign"
            className={`
                ${className}
                inline-flex items-center justify-center
                rounded-full font-bold
                border-2 border-yellow-400
                bg-white text-yellow-600 hover:bg-yellow-50
                transition-all duration-200 select-none
                cursor-pointer
            `}
        >
            <ExclamationCircleIcon className="w-[1.6cqi] h-[1.6cqi] mr-[0.5cqi]" />
            Report
        </button>
    );
}
