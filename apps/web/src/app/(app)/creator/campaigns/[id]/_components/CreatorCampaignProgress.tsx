import React from 'react';

export function CreatorCampaignProgress({ campaign, progress }: { campaign: any, progress: number }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border-1 border-gray-300 flex flex-col justify-center px-6 py-5 h-full">
            <h3 className="text-lg font-black text-gray-900 italic mb-2">Funding Progress</h3>
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#0891B2] tracking-tight">{Number(campaign.currentRaisedAmount || 0).toLocaleString()}</span>
                    <span className="text-xl font-black text-gray-400">/ {Number(campaign.fundingGoalAmount || 0).toLocaleString()} VND</span>
                </div>
                <span className="text-2xl font-black text-gray-900">{Math.min(progress, 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-[#0891B2] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
            </div>
        </div>
    );
}
