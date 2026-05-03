"use client";

import { useState } from "react";

interface CampaignDescriptionProps {
    description: string;
}

export function CampaignDescription({ description = "" }: CampaignDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-sm border-1 border-gray-300 p-6 lg:p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-[#47c9e5] rounded-full"></div>
                <h2 className="text-xl italic font-black text-gray-900 tracking-tight">Campaign Description</h2>
            </div>
            <div className={`text-gray-700 leading-relaxed text-[15px] font-medium transition-all duration-300 ${!isExpanded ? "line-clamp-4" : ""}`}>
                {description}
            </div>
            {description.length > 300 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-sm font-bold text-[#47c9e5] hover:text-cyan-600 transition-all flex items-center gap-1.5"
                >
                    {isExpanded ? "Show less" : "Show more"}
                    <div className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </button>
            )}
        </div>
    );
}
