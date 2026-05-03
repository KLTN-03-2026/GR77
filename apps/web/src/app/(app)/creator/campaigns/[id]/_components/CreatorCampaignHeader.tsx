import React from 'react';
import Link from 'next/link';
import { MapPinIcon, CalendarIcon, ShareIcon } from '@heroicons/react/24/outline';
import { TagIcon, CheckBadgeIcon, UserIcon } from '@heroicons/react/24/solid';

export function CreatorCampaignHeader({ campaign, setWithdrawalModalOpen }: { campaign: any, setWithdrawalModalOpen: (open: boolean) => void }) {
    const creatorName = campaign.creatorUser?.profile
        ? `${campaign.creatorUser.profile.firstName || ''} ${campaign.creatorUser.profile.lastName || ''}`.trim() || campaign.creatorUser.username
        : campaign.creatorUser?.username || 'Người dùng';

    const creatorAvatar = campaign.creatorUser?.profile?.avatarUrl || null;

    return (
        <div className="h-full flex flex-col py-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="bg-[#0891B2]/10 px-4 py-2 rounded-full flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-[#0891B2]" />
                    <span className="text-xs font-black text-[#0891B2] uppercase tracking-widest">{campaign.category || 'GENERAL'}</span>
                </div>
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${campaign.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-600 border-green-100'
                    : campaign.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                    <div className={`h-2 w-2 rounded-full ${campaign.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs font-black uppercase tracking-widest">{campaign.status}</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mb-4 py-1">
                <div className="flex items-center gap-2 text-gray-500">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-bold">{campaign.locationText || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-bold">Created Date: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '---'}</span>
                </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                {campaign.title}
            </h1>

            <div className="mt-auto">
                <div className="flex gap-4">
                    <Link
                        href={`/home/${campaign.id}?from=creator/campaigns`}
                        className="bg-white border-2 border-[#0891B2] text-[#0891B2] hover:bg-[#0891B2] hover:text-white px-8 py-2.5 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <ShareIcon className="h-4 w-3.5" />
                        View Public Page
                    </Link>

                    <button
                        onClick={() => setWithdrawalModalOpen(true)}
                        className="bg-white border-2 border-[#724E97] hover:bg-[#724E97] hover:text-white text-[#724E97] px-8 py-2.5 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.55-.22-2.203-.702-1.172-.879-1.172-2.303 0-3.182 1.172-.879 3.07-.879 4.242 0 .493.37.79.88.879 1.414m-7.333 4.19-.068.581c-.135.53-.418 1.012-.879 1.414m-12.019-12 1.642 1.642" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25V7.5A2.25 2.25 0 0 0 12.75 5.25h-1.5A2.25 2.25 0 0 0 9 7.5v.75m6 7.5V16.5a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-.75" />
                        </svg>
                        Request Withdrawal
                    </button>
                </div>
            </div>
        </div>
    );
}
