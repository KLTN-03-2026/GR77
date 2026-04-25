'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { PublicCampaign } from '../types/campaign';

/* ─── tiny helpers ─── */
function formatCurrency(n: number | string) {
  return Number(n).toLocaleString('en-US');
}

function progressPct(raised: number, goal: number) {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/* ─── reusable campaign card ─── */
export function CampaignPublicCard({ campaign }: { campaign: PublicCampaign }) {
  const pct = progressPct(campaign.currentRaisedAmount, campaign.fundingGoalAmount);
  const categoryName = campaign.categoryRel?.name ?? campaign.category ?? '';
  const router = useRouter();

  /* Click anywhere on the card (except the Donate button) → go to detail */
  const handleCardClick = () => {
    router.push(`/campaigns/${campaign.id}`);
  };

  /* Click Donate Now → always scroll to signup form */
  const handleDonateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // ← block the card click

    sessionStorage.setItem('returnAfterLogin', `/home/${campaign.id}`);

    const signupEl = document.getElementById('signup-form');
    if (signupEl) {
      signupEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#signup-form');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-blue-300 relative z-0 hover:z-10"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 flex-shrink-0">
        {campaign.coverImageUrl ? (
          <img
            src={campaign.coverImageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}

        {/* badges */}
        <div className="absolute inset-0 p-3 flex items-start justify-between pointer-events-none">
          {categoryName && (
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 shadow-sm capitalize">
              {categoryName}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3
          className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-[#146175] transition-colors"
          style={{ minHeight: '2.5rem' }}
        >
          {campaign.title}
        </h3>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[13px] font-bold text-[#2C8DA5]">Amount Raised ₫</span>
            <span className="text-[13px] font-bold text-[#146175]">{pct}%</span>
          </div>
          <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#77E4FF] via-[#58B6CE] to-[#2A95AF] rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-gray-500">
            {formatCurrency(campaign.currentRaisedAmount)}{' '}
            <span className="font-normal text-gray-400">/ {formatCurrency(campaign.fundingGoalAmount)} VND</span>
          </p>
        </div>

        {/* Created At */}
        <div className="pt-1">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9 3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zM14.25 15h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zM16.5 15h.008v.008H16.5V15zm0 2.25h.008v.008H16.5v-.008z" />
            </svg>
            Created at: {formatDate(campaign.createdAt)}
          </span>
        </div>

        {/* Donate Button */}
        <div className="pt-2 mt-auto">
          <div className="relative p-[2px] rounded-full overflow-hidden flex items-center justify-center">
            {/* Spinning background */}
            <div
              className="absolute inset-[-300%] bg-[conic-gradient(from_0deg_at_50%_50%,#579DFF_0%,#FF5252_25%,#FFD033_50%,#46D369_75%,#579DFF_100%)]"
              style={{ animation: 'spin 3s linear infinite' }}
            />

            {/* Inner button */}
            <button
              type="button"
              onClick={handleDonateClick}
              className="relative z-10 w-full py-2 bg-white rounded-full text-[#146175] font-black text-lg hover:bg-white/40 backdrop-blur-lg hover:text-black active:scale-95 active:shadow-inner transition-transform transition-colors focus:outline-none"
            >
              Donate Now
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
