'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, Bars3CenterLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import FavoriteButton from '@/components/campaign/FavoriteButton';

interface CampaignCardProps {
    campaign: any;
    isFavorited: boolean;
    onFavoriteToggle: (campaignId: string, nowFavorited: boolean) => void;
}

export default function CampaignCard({ campaign, isFavorited, onFavoriteToggle }: CampaignCardProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount: number | string) => {
        return Number(amount).toLocaleString('vi-VN');
    };

    return (
        <Link
            href={`/home/${campaign.id}`}
            className="block group [container-type:inline-size] [container-name:hcard] md:aspect-[3.5/1] aspect-auto"
        >
            <div className="flex w-full h-full overflow-hidden bg-white rounded-[5cqi] md:rounded-[3.5cqi] border-[1.5px] border-[#e3e9f1] transition-all hover:border-cyan-400 md:flex-row flex-col">
                {/* Image Section */}
                <div className="h-full shrink-0 flex items-center md:w-[28cqi] md:min-w-[28cqi] md:p-[1.5cqi] w-full p-0">
                    <div className="relative w-full overflow-hidden md:aspect-square aspect-[3/2] md:rounded-[2cqi] rounded-t-[5cqi] rounded-b-0">
                        {campaign.coverImageUrl ? (
                            <img
                                src={campaign.coverImageUrl}
                                alt={campaign.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
                                <Bars3CenterLeftIcon className="md:w-[8cqi] md:h-[8cqi] w-[12cqi] h-[12cqi] text-[#496D96]" />
                            </div>
                        )}
                        <span className="absolute md:top-[1cqi] md:left-[1cqi] top-[3cqi] left-[3cqi] md:px-[1.4cqi] md:py-[0.4cqi] px-[3cqi] py-[1.5cqi] md:text-[1.3cqi] text-[3.5cqi] font-bold bg-white/90 text-black shadow-sm capitalize rounded-full">
                            {campaign.categoryRel?.name || campaign.category}
                        </span>
                        <span className={`absolute md:top-[1cqi] md:right-[1cqi] top-[3cqi] right-[3cqi] md:px-[1.4cqi] md:py-[0.4cqi] px-[3cqi] py-[1.5cqi] md:text-[1.3cqi] text-[3.5cqi] font-bold uppercase shadow-sm rounded-full ${campaign.status === 'ACTIVE' ? 'bg-green-100/90 text-green-600' : 'bg-yellow-100/90 text-yellow-600'}`}>
                            {campaign.status}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden md:p-[1.8cqi_3cqi_2cqi] p-[4.5cqi]">
                    <div>
                        <h2 className="font-extrabold text-gray-900 overflow-hidden text-ellipsis md:text-[2.4cqi] text-[6.8cqi] md:mb-[0.5cqi] mb-[2.5cqi] leading-[1.3]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {campaign.title}
                        </h2>
                        {campaign.locationText && (
                            <div className="flex items-center text-gray-400 gap-[1.5cqi] md:gap-[0.5cqi] md:text-[1.4cqi] text-[4cqi] md:mb-[0.5cqi] mb-[2.5cqi]">
                                <MapPinIcon className="shrink-0 md:w-[1.6cqi] md:h-[1.6cqi] w-[4.5cqi] h-[4.5cqi]" />
                                <span>{campaign.locationText}</span>
                            </div>
                        )}
                        <p className="font-bold text-slate-700 md:text-[1.8cqi] text-[6cqi] md:mt-[0.5cqi] mt-[2.5cqi] leading-[1.5]">
                            Goal: <span className="font-black text-[#14ABD1]">{formatCurrency(campaign.fundingGoalAmount)} VND</span>
                        </p>
                        <p className="font-bold text-gray-400 uppercase md:text-[1.2cqi] text-[4cqi] md:mt-[0.2cqi] mt-[1cqi]">
                            Min Donation: {formatCurrency(campaign.minimumDonationAmount)} VND
                        </p>
                        <div className="flex flex-wrap items-center md:gap-[1cqi] gap-[2cqi] md:mt-[0.4cqi] mt-[3.5cqi]">
                            <div className="inline-flex items-center text-gray-500 bg-gray-50 border border-gray-100 rounded-[2.5cqi] md:rounded-[1.2cqi] gap-[1.5cqi] md:gap-[0.6cqi] px-[3cqi] py-[1.5cqi] md:px-[1.4cqi] md:py-[0.5cqi] md:text-[1.4cqi] text-[4cqi]">
                                <CalendarIcon className="text-gray-400 shrink-0 md:w-[1.6cqi] md:h-[1.6cqi] w-[4.5cqi] h-[4.5cqi]" />
                                <span className="font-bold">{formatDate(campaign.startAt)}</span>
                                <span className="text-gray-300 md:mx-[0.2cqi] mx-[1.5cqi]">→</span>
                                <span className="font-bold">{formatDate(campaign.endAt)}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-400 gap-[1.5cqi] md:gap-[0.5cqi] md:text-[1.4cqi] text-[4cqi] md:mt-[0.8cqi] mt-[2cqi]">
                            <HeartIcon className="text-pink-400 shrink-0 md:w-[1.6cqi] md:h-[1.6cqi] w-[4.5cqi] h-[4.5cqi]" />
                            <span className="font-bold">{campaign.favoritesCount || 0} favorites</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-[1.5cqi] md:gap-[1cqi] md:mt-[1cqi] mt-[5cqi] flex-wrap">
                        <span className="md:min-w-[14cqi] flex-1 md:flex-none px-[3cqi] py-[2.2cqi] md:px-[1cqi] md:py-[0.7cqi] md:text-[1.3cqi] text-[4cqi] flex items-center justify-center font-bold border-2 border-[#496D96] bg-transparent text-[#496D96] cursor-pointer text-center whitespace-nowrap hover:bg-[#B2CDEB] rounded-full transition-all">
                            View Details
                        </span>
                        <FavoriteButton
                            campaignId={campaign.id}
                            initialFavorited={isFavorited}
                            onToggle={onFavoriteToggle}
                            className="md:min-w-[14cqi] flex-1 md:flex-none px-[3cqi] py-[2.2cqi] md:px-[1cqi] md:py-[0.7cqi] md:text-[1.3cqi] text-[4cqi]"
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
