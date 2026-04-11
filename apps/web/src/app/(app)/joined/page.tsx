"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import styles from '@/components/campaign/CampaignCard.module.css';

function formatCurrency(amount: number | string) {
  return Number(amount).toLocaleString('vi-VN');
}

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export default function KindlinkJoinedPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchJoinedCampaigns = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/participants/me?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.items);
          setTotalPages(data.meta.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch joined campaigns", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJoinedCampaigns();
  }, [currentPage]);

  const fallbackImage = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="w-full">
      <div className="mb-2 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
          <UserPlus className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-500" />
          Joined Campaigns
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5 ml-[22px] sm:ml-9">Chiến dịch bạn đã tham gia</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
          <p className="text-gray-400 font-medium">Loading your campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <p className="text-gray-500 text-lg">You haven't joined any campaigns yet.</p>
          <Link href="/list" className="px-6 py-2 bg-cyan-50 text-cyan-600 font-bold rounded-full hover:bg-cyan-100 transition-colors">
            Explore Campaigns
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-[2vw]">
            {campaigns.map((cp) => (
              <div key={cp.participantId} className="group [container-type:inline-size] [container-name:hcard] md:aspect-[3.5/1] aspect-auto overflow-hidden">
                <div className="flex w-full h-full overflow-hidden bg-white rounded-[5cqi] md:rounded-[3.5cqi] border-[1.5px] border-[#e3e9f1] transition-all hover:border-cyan-400 hover:shadow-[0_8px_30px_rgba(65,203,238,0.15)] md:flex-row flex-col">
                  {/* Image Section */}
                  <div className="h-full shrink-0 flex items-center md:w-[28cqi] md:min-w-[28cqi] md:p-[1.5cqi] w-full p-0">
                    <div className="relative w-full overflow-hidden md:aspect-square aspect-[3/2] md:rounded-[2cqi] rounded-t-[5cqi] rounded-b-0">
                      <img
                        src={cp.coverImageUrl || fallbackImage}
                        alt={cp.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {cp.category && (
                        <span className="absolute md:top-[1cqi] md:left-[1cqi] top-[3cqi] left-[3cqi] md:px-[1.4cqi] md:py-[0.4cqi] px-[3cqi] py-[1.5cqi] md:text-[1.3cqi] text-[3.5cqi] font-bold bg-white/90 text-black shadow-sm capitalize rounded-full">
                          {cp.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden md:p-[1.8cqi_3cqi_1cqi] p-[4.5cqi]">
                    <div>
                      <Link href={`/joined/${cp.id}`}>
                        <h2 className="font-extrabold text-gray-900 overflow-hidden text-ellipsis md:text-[2.4cqi] text-[6.8cqi] md:mb-[0.5cqi] mb-[2.5cqi] leading-[1.3] cursor-pointer" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {cp.title}
                        </h2>
                      </Link>
                      <p className="font-bold text-slate-700 md:text-[1.8cqi] text-[6cqi] md:mt-[0.5cqi] mt-[2.5cqi] leading-[1.5]">
                        Goal: <span className="text-[#14ABD1] font-black">{formatCurrency(cp.fundingGoalAmount)} VND</span>
                      </p>

                      <div className="relative w-full md:max-w-[36cqi] md:mt-[1cqi] mt-[3.5cqi]">
                        <input
                          type="text"
                          readOnly
                          value={`Start at: ${formatDate(cp.startAt)}`}
                          className="w-full border border-gray-200 bg-gray-50/30 text-gray-400 font-medium outline-none cursor-pointer md:rounded-[1.6cqi] md:px-[1.4cqi] md:py-[0.8cqi] md:pr-[3.5cqi] px-[4cqi] py-[3cqi] pr-[9cqi] md:text-[1.4cqi] text-[4.5cqi] rounded-[3cqi]"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none md:right-[1.2cqi] right-[3.5cqi]">
                          <Calendar className="text-gray-400 md:w-[1.6cqi] md:h-[1.6cqi] w-[5cqi] h-[5cqi]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between border-t border-gray-100 md:p-0 md:pt-[1cqi] md:mt-[0.8cqi] p-[3.5cqi] mt-[3.5cqi] gap-[3cqi] md:gap-[1cqi] md:flex-row flex-col md:items-center items-start">
                      <div className="flex items-center italic text-gray-400 md:text-[1.4cqi] text-[4.5cqi] gap-[1.5cqi] md:gap-[0.5cqi]">
                        <Clock className="shrink-0 md:w-[1.6cqi] md:h-[1.6cqi] w-[4.5cqi] h-[4.5cqi]" />
                        <span>
                          Joined at: <span className="not-italic text-gray-900 md:ml-[0.2cqi] ml-[0.5cqi]">{formatTime(cp.joinedAt)}</span>
                        </span>
                      </div>
                      <Link href={`/joined/${cp.id}`} className="inline-flex items-center font-bold text-blue-500 no-underline hover:underline hover:text-blue-600 transition-all md:text-[1.4cqi] text-[4cqi] gap-[0.2cqi]">
                        View Detail
                        <ChevronRight className="md:w-[1.6cqi] md:h-[1.6cqi] w-[4.5cqi] h-[4.5cqi]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-16 pb-12">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl border border-gray-100 text-gray-400 disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === i ? "bg-cyan-400 text-white shadow-lg shadow-cyan-100 scale-110" : "border border-gray-100 text-gray-400 hover:bg-gray-50"
                      }`}
                  >
                    {i}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl border border-gray-100 text-gray-400 disabled:opacity-30 hover:bg-gray-50 transition-all active:translate-x-1"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}