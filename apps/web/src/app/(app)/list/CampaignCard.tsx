'use client';

import React from 'react';
import Link from 'next/link';
import { MapPinIcon, Bars3CenterLeftIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import FavoriteButton from '@/components/campaign/FavoriteButton';

const TEAL = '#0891B2';

interface CampaignCardProps {
    campaign: any;
    isFavorited: boolean;
    onFavoriteToggle: (campaignId: string, nowFavorited: boolean) => void;
}

export default function CampaignCard({ campaign, isFavorited, onFavoriteToggle }: CampaignCardProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const formatCurrency = (amount: number | string) => {
        return Number(amount).toLocaleString('vi-VN');
    };

    return (
        <div
            className="group [container-type:inline-size] [container-name:acard] md:aspect-[4.6/1] aspect-auto overflow-hidden bg-white rounded-[3cqi] md:rounded-[1cqi] border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
        >
            <div className="flex w-full h-full overflow-hidden md:flex-row flex-col">
                {/* ── Image ── */}
                <div className="relative shrink-0 md:w-[29cqi] w-full overflow-hidden">
                    <div className="w-full h-full aspect-[2.2/1] md:aspect-auto">
                        {campaign.coverImageUrl ? (
                            <img
                                src={campaign.coverImageUrl}
                                alt={campaign.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D4F4F 0%, #115E59 100%)' }}>
                                <Bars3CenterLeftIcon className="md:w-[8cqi] md:h-[8cqi] w-12 h-12 text-white/30" />
                            </div>
                        )}
                    </div>
                    {/* Status + Category badges stacked top-left */}
                    <div className="absolute md:top-[1cqi] md:left-[1cqi] top-3 left-3 flex flex-col md:gap-[0.5cqi] gap-1">
                        <span
                            className={`md:px-[1.2cqi] md:py-[0.4cqi] px-3 py-1 md:text-[1cqi] text-[10px] font-extrabold uppercase tracking-wider rounded-full w-fit ${campaign.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                                }`}
                        >
                            {campaign.status}
                        </span>
                        <span className="md:px-[1.2cqi] md:py-[0.4cqi] px-3 py-1 md:text-[1cqi] text-[10px] font-bold bg-white/90 text-gray-800 shadow-sm capitalize rounded-full w-fit">
                            {campaign.categoryRel?.name || campaign.category || 'General'}
                        </span>
                    </div>
                    {/* Favorite count badge */}
                    <div className="absolute md:top-[1cqi] md:right-[1cqi] top-3 right-3 md:px-[1cqi] md:py-[0.4cqi] px-2.5 py-1 flex items-center md:gap-[0.4cqi] gap-1 bg-white/95 backdrop-blur-sm rounded-full shadow-sm text-rose-500">
                        <HeartIcon className="md:w-[1.2cqi] md:h-[1.2cqi] w-3.5 h-3.5" />
                        <span className="md:text-[1.1cqi] text-[11px] font-bold">{campaign.favoritesCount ?? 0}</span>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden md:p-[1.3cqi_2.5cqi_1.6cqi] p-4">
                    <div>
                        {/* Top row: title — fixed 2-line height */}
                        <div className="flex items-center md:h-[4.4cqi] h-[44px] md:mb-[1cqi] mb-1">
                            <h2 className="font-bold md:text-[1.8cqi] text-base text-gray-900 leading-snug overflow-hidden text-ellipsis w-full" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {campaign.title}
                            </h2>
                        </div>

                        {/* Location */}
                        {campaign.locationText && (
                            <div className="flex items-center md:gap-[0.5cqi] gap-1 text-gray-500 md:text-[1.2cqi] text-xs md:mb-[0.6cqi] mb-2">
                                <MapPinIcon className="shrink-0 md:w-[1.4cqi] md:h-[1.4cqi] w-3.5 h-3.5" style={{ color: TEAL }} />
                                <span className="truncate">{campaign.locationText}</span>
                            </div>
                        )}
                        {/* Timeline */}
                        <div className="md:mb-[0.8cqi] mb-2">
                            <p className="md:text-[1.3cqi] text-xs font-medium flex text-gray-500 items-center gap-1">
                                <CalendarDaysIcon className="shrink-0 md:w-[1.4cqi] md:h-[1.4cqi] w-3.5 h-3.5" style={{ color: TEAL }} />
                                {formatDate(campaign.startAt)} – {formatDate(campaign.endAt)}
                            </p>
                        </div>
                        {/* Financial row */}
                        <div className="flex flex-wrap items-end md:gap-x-[3cqi] gap-x-6 gap-y-2 md:mb-[0.5cqi] mb-1.5">
                            <div>
                                <p className="md:text-[1cqi] text-[10px] font-semibold uppercase tracking-wider text-gray-500 md:mb-[0.3cqi] mb-0.5">Min Donate</p>
                                <p className="md:text-[1.4cqi] text-sm font-bold" style={{ color: TEAL }}>
                                    {formatCurrency(campaign.minimumDonationAmount)} VND
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Bottom row: buttons */}
                    <div className="flex md:flex-row flex-col md:items-center justify-between mt-auto md:pt-[1.2cqi] pt-2 border-t border-gray-200 md:gap-[1.5cqi] gap-3">
                        <div className="flex items-stretch md:gap-[1cqi] gap-2 w-full md:w-auto">
                            <Link
                                href={`/home/${campaign.id}?from=list`}
                                className="inline-flex items-center justify-center flex-1 md:flex-none md:w-[13cqi] md:h-[3.5cqi] md:px-[1cqi] md:py-[0.5cqi] md:text-[1.3cqi] h-9 text-xs font-bold bg-white rounded-full border-2 shadow-sm transition-all duration-200 active:scale-95"
                                style={{
                                    color: TEAL,
                                    borderColor: TEAL
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = TEAL;
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                    e.currentTarget.style.color = TEAL;
                                }}
                            >
                                View Details
                            </Link>
                            <div onClick={(e) => e.stopPropagation()} className="flex-1 md:flex-none flex">
                                <FavoriteButton
                                    campaignId={campaign.id}
                                    initialFavorited={isFavorited}
                                    onToggle={onFavoriteToggle}
                                    className="w-full md:w-[13cqi] md:h-[3.5cqi] md:px-[1cqi] md:py-[0.5cqi] md:text-[1.3cqi] h-9 text-xs !border-[1.5px]"
                                    hideIcon={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
