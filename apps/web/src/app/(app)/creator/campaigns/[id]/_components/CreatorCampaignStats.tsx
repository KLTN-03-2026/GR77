import React from 'react';

export function CreatorCampaignStats({ campaign }: { campaign: any }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border-1 border-gray-300 flex items-center justify-center divide-x divide-gray-100 py-5 h-full">
            <div className="flex-1 text-center px-4">
                <div className="text-lg font-black text-gray-900 mb-1 italic">Joined</div>
                <div className="text-xl font-black text-[#0891B2]">{campaign.participantsCount || 0}</div>
            </div>
            <div className="flex-1 text-center px-4">
                <div className="text-lg font-black text-gray-900 mb-1 italic">Days left</div>
                <div className="text-xl font-black text-gray-500">
                    {campaign.endAt ? Math.max(0, Math.ceil((new Date(campaign.endAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '---'}
                </div>
            </div>
        </div>
    );
}
