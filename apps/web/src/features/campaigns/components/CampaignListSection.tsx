'use client';

import React from 'react';
import Link from 'next/link';
import { CampaignPublicCard } from './CampaignPublicCard';
import { useCampaignList } from '../hooks/useCampaignList';

/* ─── skeleton loader ─── */
function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-1.5 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  );
}

/* ─── homepage campaign preview (1 row × 4 cols + View All) ─── */
export default function CampaignListSection() {
  const { paginated, isLoading, error } = useCampaignList({ itemsPerPage: 4 });

  return (
    <section id="campaigns" className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
              Featured Campaigns
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Discover and contribute to the campaigns that need your help
            </p>
          </div>
          <Link
            href="/campaigns"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors group"
          >
            View All
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Grid – 1 row × 4 cols */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-400 font-medium">{error}</div>
        ) : paginated.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">🕊️</div>
            <p className="text-gray-400 font-medium">No campaigns found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((c) => (
              <CampaignPublicCard key={c.id} campaign={c} />
            ))}
          </div>
        )}

        {/* Mobile "View All" link */}
        <div className="flex sm:hidden justify-center mt-8">
          <Link
            href="/campaigns"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full border-2 border-cyan-400 text-cyan-600 font-semibold text-sm hover:bg-cyan-50 transition-all"
          >
            View All Campaigns
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

