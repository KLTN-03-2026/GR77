"use client";

import React from "react";

interface CampaignMetaProps {
    campaign: any;
    formatDate: (date?: string) => string;
}

export function CampaignMeta({ campaign, formatDate }: CampaignMetaProps) {
    if (!campaign) return null;

    return (
        <section className="relative space-y-5 py-1">
            <div className="absolute left-[5.5px] top-4 bottom-4 w-[1px] bg-gray-200"></div>
            {/* Timeline Row: Category */}
            <div className="flex items-center gap-3 relative text-base">
                <div className="w-3 h-3 bg-black z-10 shrink-0 rounded-full"></div>
                <div className="flex items-center gap-x-3 gap-y-1">
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Category</span>
                    <span className="font-bold px-3 py-0.5 text-[10px] bg-black text-white rounded-full">
                        {campaign.categoryRel?.name || campaign.category}
                    </span>
                </div>
            </div>

            {/* Timeline Row: Status */}
            <div className="flex items-center gap-3 relative text-base">
                <div className="w-3 h-3 bg-black z-10 shrink-0 rounded-full"></div>
                <div className="flex items-center gap-x-3 gap-y-1">
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Status</span>
                    <span className={`font-bold px-3 py-0.5 text-[10px] rounded-full ${campaign.status === "ACTIVE" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
                        {campaign.status}
                    </span>
                </div>
            </div>

            {/* Timeline Row: Timeline */}
            <div className="flex items-center gap-3 relative text-base">
                <div className="w-3 h-3 bg-black z-10 shrink-0 rounded-full"></div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Timeline</span>
                    <div className="flex items-center flex-nowrap gap-1.5 font-bold text-gray-900 text-[13px] sm:text-base whitespace-nowrap overflow-hidden">
                        <span>{formatDate(campaign.startAt)}</span>
                        <span className="text-gray-300">→</span>
                        <span>{formatDate(campaign.endAt)}</span>
                    </div>
                </div>
            </div>

            {/* Timeline Row: Location */}
            <div className="flex items-center gap-3 relative text-base">
                <div className="w-3 h-3 bg-black z-10 shrink-0 rounded-full"></div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Location</span>
                    <span className="font-bold text-gray-900 uppercase tracking-wide text-[12px] sm:text-sm line-clamp-2">{campaign.locationText || '—'}</span>
                </div>
            </div>
        </section>
    );
}
