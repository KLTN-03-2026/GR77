"use client";

import React from "react";

interface CampaignMetaProps {
    campaign: any;
    formatDate: (date?: string) => string;
}

export function CampaignMeta({ campaign, formatDate }: CampaignMetaProps) {
    if (!campaign) return null;

    return (
        <section className="relative space-y-8 py-2">
            <div className="absolute left-[7px] top-6 bottom-6 w-[2px] bg-gray-200"></div>
            {/* Timeline Row: Category */}
            <div className="flex items-center gap-4 relative text-base">
                <div className="w-4 h-4 bg-black rounded-full z-10 shrink-0"></div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">Category</span>
                    <span className="font-bold px-4 py-1 rounded-full text-xs bg-black text-white">
                        {campaign.categoryRel?.name || campaign.category}
                    </span>
                </div>
            </div>

            {/* Timeline Row: Status */}
            <div className="flex items-center gap-4 relative text-base">
                <div className="w-4 h-4 bg-black rounded-full z-10 shrink-0"></div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">Status</span>
                    <span className={`font-bold px-4 py-1 rounded-full text-xs ${campaign.status === "ACTIVE" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
                        {campaign.status}
                    </span>
                </div>
            </div>

            {/* Timeline Row: Timeline */}
            <div className="flex items-center gap-4 relative text-base">
                <div className="w-4 h-4 bg-black rounded-full z-10 shrink-0"></div>
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">Timeline</span>
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                        <span>{formatDate(campaign.startAt)}</span>
                        <span className="text-gray-300">→</span>
                        <span>{formatDate(campaign.endAt)}</span>
                    </div>
                </div>
            </div>

            {/* Timeline Row: Location */}
            <div className="flex items-center gap-4 relative text-base">
                <div className="w-4 h-4 bg-black rounded-full z-10 shrink-0"></div>
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-widest">Location</span>
                    <span className="font-bold text-gray-900 uppercase tracking-wide">{campaign.locationText || '—'}</span>
                </div>
            </div>
        </section>
    );
}
