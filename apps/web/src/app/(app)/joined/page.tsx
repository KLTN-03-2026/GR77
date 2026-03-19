"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

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

        const res = await fetch(`http://localhost:3001/participants/me?page=${currentPage}&limit=${itemsPerPage}`, {
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
    <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-cyan-500" />
            Joined Campaigns
          </h1>
          <p className="text-sm text-gray-400 mt-1 ml-9">Chiến dịch bạn đã tham gia</p>
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
            <div className="space-y-6">
              {campaigns.map((cp) => (
                <div key={cp.participantId} className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="w-full md:w-[35%] p-4 h-56 md:h-auto">
                    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                      <img src={cp.coverImageUrl || fallbackImage} alt={cp.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  </div>

                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <Link href={`/joined/${cp.id}`}>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer leading-tight line-clamp-2">
                          {cp.title}
                        </h2>
                      </Link>
                      <p className="text-lg font-semibold text-gray-600 mb-6 italic">
                        Funding Goal <span className="text-pink-500 not-italic">{formatCurrency(cp.fundingGoalAmount)} VND</span>
                      </p>

                      <div className="relative max-w-xs mb-6 group/input">
                        <input
                          type="text"
                          readOnly
                          value={`Start at: ${formatDate(cp.startAt)}`}
                          className="w-full p-3 pr-10 border border-gray-200 rounded-2xl text-sm bg-gray-50/30 outline-none focus:border-blue-400 cursor-pointer text-gray-500 font-medium transition-all"
                        />
                        <Calendar className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover/input:text-blue-500 transition-colors" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-gray-400 transition-all">
                        <Clock className="w-4 h-4 transition-all" />
                        <span className="text-sm font-medium italic">
                          Joined at: <span className="text-gray-900 not-italic ml-1">{formatTime(cp.joinedAt)}</span>
                        </span>
                      </div>
                      <Link href={`/joined/${cp.id}`} className="text-blue-500 font-bold text-sm flex items-center gap-1 transition-all active:scale-95 hover:underline hover:text-blue-600">
                        View Detail
                        <ChevronRight className="w-4 h-4 transition-all" />
                      </Link>
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