import React, { useState } from 'react';
import { ParticipantsModal } from '@/components/campaign/ParticipantsModal';

export function CreatorCampaignStats({ campaign }: { campaign: any }) {
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border-1 border-gray-300 flex items-center justify-center divide-x divide-gray-100 py-5 h-full">
                <div
                    className="group flex-1 text-center px-4 cursor-pointer hover:bg-[#0891B2]/50 transition-colors py-2"
                    onClick={() => setIsParticipantsModalOpen(true)}
                >
                    <div className="text-lg font-black text-gray-900 mb-1 italic group-hover:text-black group-hover:underline transition-colors">Members</div>
                    <div className="text-xl font-black text-[#0891B2] group-hover:text-black group-hover:underline transition-colors">{campaign.participantsCount || 0}</div>
                </div>
                <div className="flex-1 text-center px-4">
                    <div className="text-lg font-black text-gray-900 mb-1 italic">Days left</div>
                    <div className="text-xl font-black text-gray-500">
                        {campaign.endAt ? Math.max(0, Math.ceil((new Date(campaign.endAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : '---'}
                    </div>
                </div>
            </div>

            <ParticipantsModal
                isOpen={isParticipantsModalOpen}
                onClose={() => setIsParticipantsModalOpen(false)}
                campaignId={campaign.id}
            />
        </>
    );
}
