'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchPublicCampaignById } from '@/features/campaigns/services/campaignService';
import type { PublicCampaign } from '@/features/campaigns/types/campaign';

/* ─── helpers ─────────────────────────────────────────────────── */
function formatCurrency(n: number | string) {
  return Number(n).toLocaleString('en-US');
}

function progressPct(raised: number, goal: number) {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

function daysLeft(endAt?: string) {
  if (!endAt) return null;
  const diff = new Date(endAt).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/* ─── image carousel ──────────────────────────────────────────── */
function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images.length)
    return (
      <div className="w-full aspect-[16/8] rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <svg className="w-20 h-20 text-blue-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
        </svg>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[16/8] rounded-3xl overflow-hidden bg-black group shadow-xl">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${title} ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${i === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          />
        ))}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIdx((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 text-xl shadow-lg"
            >
              ‹
            </button>
            <button
              onClick={() => setIdx((p) => (p + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50 text-xl shadow-lg"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? 'border-cyan-500 ring-2 ring-cyan-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
            >
              <img src={src} className="w-full h-full object-cover" alt={`thumb ${i}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── donate gate ─────────────────────────────────────────────── */
function DonateGateButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleDonate = () => {
    if (isLoggedIn) {
      router.push(`/home/${campaignId}`);
    } else {
      sessionStorage.setItem('returnAfterLogin', `/home/${campaignId}`);
      router.push('/login?reason=donate');
    }
  };

  return (
    <button
      id="donate-btn"
      onClick={handleDonate}
      className="w-full py-3 rounded-full border-2 border-cyan-400 bg-white text-cyan-600 font-extrabold text-base tracking-wide shadow-sm hover:shadow-md hover:bg-cyan-100 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
    >
      Donate
    </button>
  );
}

/* ─── skeleton ─────────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-[1200px] mx-auto px-4 py-10">
      <div className="h-8 bg-gray-100 rounded-full w-1/3" />
      <div className="aspect-[16/8] bg-gray-100 rounded-3xl w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-gray-100 rounded-full w-3/4" />
          <div className="h-4 bg-gray-100 rounded-full w-full" />
          <div className="h-4 bg-gray-100 rounded-full w-5/6" />
        </div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded-2xl w-full" />
          <div className="h-12 bg-gray-100 rounded-2xl w-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── page ─────────────────────────────────────────────────────── */
export default function PublicCampaignDetailPage() {
  const params = useParams();
  const id = String(params.id);

  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetchPublicCampaignById(id)
      .then(setCampaign)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <DetailSkeleton />;

  if (error || !campaign)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4">
        <div className="text-5xl">🕊️</div>
        <h1 className="text-2xl font-bold text-gray-700">Campaign not found</h1>
        <p className="text-gray-400 text-sm">{error}</p>
        <Link href="/#campaigns" className="mt-2 text-blue-500 hover:underline text-sm font-medium">
          ← Back to list
        </Link>
      </div>
    );

  const pct = progressPct(campaign.currentRaisedAmount, campaign.fundingGoalAmount);
  const left = daysLeft(campaign.endAt);

  const images: string[] = [];
  if (campaign.coverImageUrl) images.push(campaign.coverImageUrl);
  if (campaign.images && campaign.images.length > 0) {
    campaign.images.forEach(img => {
      if (img.url && img.url !== campaign.coverImageUrl) {
        images.push(img.url);
      }
    });
  }

  const categoryName = campaign.categoryRel?.name ?? campaign.category ?? '';

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link
            href="/#campaigns"
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Campaigns
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block px-4 py-1.5 text-xs font-semibold text-cyan-600 border-2 border-cyan-400 rounded-full hover:bg-cyan-100 hover:text-cyan-600 transition-all hover:-translate-y-0.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hidden sm:block px-4 py-1.5 text-xs font-semibold text-white border-2 border-cyan-500 bg-cyan-500 rounded-full hover:bg-cyan-600 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 py-8 lg:py-12">
        <ImageCarousel images={images} title={campaign.title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {categoryName && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold capitalize">
                    {categoryName}
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${campaign.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  {campaign.status === 'ACTIVE' ? 'In Progress' : campaign.status}
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
                {campaign.title}
              </h1>
            </div>

            {campaign.description && (
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                <h2 className="text-base font-bold text-gray-800 mb-3 not-prose">About this campaign</h2>
                <p className="whitespace-pre-line">{campaign.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Start Date', value: formatDate(campaign.startAt) },
                { label: 'End Date', value: formatDate(campaign.endAt) },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>

            {campaign.creator && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-white font-bold text-sm">
                  {campaign.creator.username?.[0]?.toUpperCase() || 'C'}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Creator</p>
                  <p className="text-sm font-bold text-gray-800">{campaign.creator.username}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-[80px] space-y-4">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {formatCurrency(campaign.currentRaisedAmount)}
                      <span className="text-sm font-bold text-gray-400 ml-1">VND</span>
                    </span>
                    <span className="text-sm font-bold text-blue-500">{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Goal: <span className="font-bold text-gray-600">{formatCurrency(campaign.fundingGoalAmount)} VND</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-50">
                  {[
                    { label: 'Donors', value: campaign.donorsCount ?? '—' },
                    { label: 'Joined', value: campaign.participantsCount ?? '—' },
                    {
                      label: left !== null && left >= 0 ? 'Days Left' : 'Days',
                      value: left !== null ? (left >= 0 ? left : 'Ended') : '—',
                    },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
                      <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">{s.label}</p>
                    </div>
                  ))}
                </div>

                <DonateGateButton campaignId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
