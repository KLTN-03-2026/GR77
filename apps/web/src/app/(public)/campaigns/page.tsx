'use client';

import React from 'react';
import Link from 'next/link';
import { CampaignPublicCard } from '@/features/campaigns/components/CampaignPublicCard';
import CampaignFilter from '@/features/campaigns/components/CampaignFilter';
import { useCampaignList } from '@/features/campaigns/hooks/useCampaignList';
import Logo from '@/components/common/logo';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, HandHeart, Leaf } from 'lucide-react';

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

/* ─── pagination ─── */
function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-cyan-400 hover:text-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
      >
        ‹
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${p === current
            ? 'bg-cyan-500 text-white shadow-sm'
            : 'border border-gray-200 text-gray-500 hover:border-cyan-400 hover:text-cyan-600'
            }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-cyan-400 hover:text-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
      >
        ›
      </button>
    </div>
  );
}

/* ─── full campaigns page ─── */
export default function CampaignsPage() {
  const {
    campaigns,
    paginated,
    categories,
    isLoading,
    error,
    filter,
    updateFilter,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useCampaignList({ itemsPerPage: 12 }); // 3 rows × 4 cols

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block px-4 py-1.5 text-xs font-semibold text-cyan-600 border-2 border-cyan-400 rounded-full hover:bg-cyan-100 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hidden sm:block px-4 py-1.5 text-xs font-semibold text-white border-2 border-cyan-500 bg-cyan-500 rounded-full hover:bg-cyan-600 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Intro Banner */}
      <section className="relative w-full bg-slate-100 overflow-hidden border-b border-gray-100">
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        `}} />

        <div className="max-w-[1200px] mx-auto px-4 py-6 lg:py-8 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-4 text-center lg:text-left z-10 animate-fade-in-up">
            <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight">
              KindLink – <span className="text-cyan-600">Blockchain</span> & <span className="text-cyan-500">Smart Contract</span> Platform
            </h1>

            <p className="text-sm lg:text-base text-gray-500 font-medium leading-relaxed max-w-2xl">
              Building a transparent charitable ecosystem where technology connects compassionate hearts.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="flex items-center justify-center gap-2.5 w-36 sm:w-40 py-2 rounded-full border-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{ borderColor: '#FFC4A4', backgroundColor: 'white' }}>
                <ShieldCheck size={16} strokeWidth={2.5} style={{ color: '#f49a69ff' }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#d86a3cff' }}>Transparent</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 w-36 sm:w-40 py-2 rounded-full border-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{ borderColor: '#FBA2D0', backgroundColor: 'white' }}>
                <HandHeart size={16} strokeWidth={2.5} style={{ color: '#f37ebaff' }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#b11f6aff' }}>Reliable</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 w-36 sm:w-40 py-2 rounded-full border-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{ borderColor: '#C688EB', backgroundColor: 'white' }}>
                <Leaf size={16} strokeWidth={2.5} style={{ color: '#b453ecff' }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#7a10c2ff' }}>Sustainable</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-[500px] relative flex justify-center lg:justify-end">
            <div className="absolute -inset-10 bg-cyan-200/20 rounded-full blur-3xl opacity-60 animate-pulse" />
            <img
              src="/images/background/bc.svg"
              alt="Blockchain Illustration"
              className="relative w-auto h-full max-h-[280px] lg:max-h-[350px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-cyan-100/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />
      </section>
      {/* end intro banner */}

      {/* Main content */}
      <main className="flex-1 py-10 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-cyan-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">All Campaigns</span>
          </div>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              All Campaigns
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Browse all campaigns and find one that inspires you to make a difference
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 w-full">
            <CampaignFilter
              filter={filter}
              categories={categories}
              onFilterChange={updateFilter}
              totalCount={campaigns.length}
            />
          </div>

          {/* Grid – 3 rows × 4 cols */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-400 font-medium">{error}</div>
          ) : paginated.length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4">🕊️</div>
              <p className="text-gray-400 font-medium">No campaigns found</p>
              <p className="text-gray-300 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginated.map((c) => (
                  <CampaignPublicCard key={c.id} campaign={c} />
                ))}
              </div>
              <Pagination
                current={currentPage}
                total={totalPages}
                onChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
