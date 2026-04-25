'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarIcon,
  HeartIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useGlobalAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/constants/endpoints';

const HERO_IMAGES = [
  '/images/banner-top.jpg',
  '/images/background-login.jpg',
  '/images/hero-home.png'
];

export default function CampaignsPage() {
  const { user } = useGlobalAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteCampaigns, setFavoriteCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [joinedCampaigns, setJoinedCampaigns] = useState<any[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
  const [trendingCampaigns, setTrendingCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('accessToken');
      const apiUrl = API_BASE_URL;
      const headers: any = token ? { 'Authorization': `Bearer ${token}` } : {};

      setIsLoading(true);
      try {
        const mapCampaign = (c: any) => ({
          id: c.id,
          title: c.title,
          image: c.coverImageUrl || c.image || 'https://via.placeholder.com/600x400',
          amountRaised: Number(c.currentRaisedAmount || c.currentAmount || c.stats?.totalAmount || 0),
          startDate: c.startAt || c.createdAt,
          targetAmount: Number(c.fundingGoalAmount || c.targetAmount || 0),
        });

        const mapList = (data: any) => {
          const items = Array.isArray(data) ? data : (data.items || []);
          return items.map((item: any) => mapCampaign(item.campaign || item));
        };

        // Fetch Trending (Public)
        const trendRes = await fetch(`${apiUrl}/campaigns?limit=4&sortBy=trending`, { headers });
        if (trendRes.ok) setTrendingCampaigns(mapList(await trendRes.json()));

        // Fetch user-specific sections only if token exists
        if (token) {
          const [favRes, actRes, joinRes, myRes] = await Promise.all([
            fetch(`${apiUrl}/favorites?limit=4`, { headers }),
            fetch(`${apiUrl}/view-histories?limit=4`, { headers }),
            fetch(`${apiUrl}/participants/me?limit=4`, { headers }),
            fetch(`${apiUrl}/campaigns/me/list?limit=4`, { headers }),
          ]);

          if (favRes.ok) setFavoriteCampaigns(mapList(await favRes.json()));
          if (actRes.ok) setActivityHistory(mapList(await actRes.json()));
          if (joinRes.ok) setJoinedCampaigns(mapList(await joinRes.json()));
          if (myRes.ok) setMyCampaigns(mapList(await myRes.json()));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // No longer redirecting, filtering is real-time via searchQuery state
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 bg-indigo-400 opacity-20"></div>
          <div className="relative rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const activeSections = [
    { title: 'Trending Campaigns', data: trendingCampaigns, color: 'indigo', icon: ArrowTrendingUpIcon, link: '/campaigns' },
    { title: 'Managed by You', data: myCampaigns, color: 'purple', icon: BriefcaseIcon, link: '/creator/campaigns' },
    { title: 'Your Communities', data: joinedCampaigns, color: 'emerald', icon: UserGroupIcon, link: '/joined' },
    { title: 'Saved for Later', data: favoriteCampaigns, color: 'pink', icon: HeartIcon, link: '/favorites' },
    { title: 'Recently Viewed', data: activityHistory, color: 'slate', icon: ClockIcon, link: '/activity' },
  ];

  const filteredSections = activeSections
    .map((section) => ({
      ...section,
      data: section.data.filter((c: any) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.data.length > 0);

  const hasContent = filteredSections.length > 0;

  return (
    <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 ${hasContent ? 'space-y-16' : 'h-[calc(100vh-120px)] flex flex-col justify-between'} bg-slate-50/50`}>

      {/* 1. Hero / Welcome Section */}
      <section className="relative group flex-shrink-0">
        <div className="absolute inset-0 bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-xl">
          {HERO_IMAGES.map((src, idx) => (
            <Image
              key={src}
              src={src}
              alt={`Impact Banner ${idx + 1}`}
              fill
              priority={idx === 0}
              className={`object-cover transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-60 scale-100' : 'opacity-0 scale-105'
                }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent"></div>
        </div>

        <div className="relative z-10 px-6 pt-10 pb-6 sm:px-12 sm:pt-16 sm:pb-8 flex flex-col md:flex-row gap-8 items-center justify-between min-h-[220px] sm:min-h-[280px]">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight tracking-tight drop-shadow-md">
              Every Act of <span className="italic text-indigo-200">Kindness</span> Counts
            </h1>
            <p className="text-slate-300 text-sm font-medium max-w-lg leading-relaxed mx-auto md:mx-0">
              Connect with missions that matter and help create a better world for everyone.
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-wrap gap-3 justify-center">
            {[
              { icon: HeartIcon, val: favoriteCampaigns.length, color: 'text-pink-400' },
              { icon: UserGroupIcon, val: joinedCampaigns.length, color: 'text-emerald-400' },
              { icon: BriefcaseIcon, val: myCampaigns.length, color: 'text-orange-300' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-3 px-5 rounded-2xl flex items-center gap-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <div className="text-lg font-semibold text-white">{stat.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <form onSubmit={handleSearch} className="flex justify-center -mt-6 relative z-20 px-4 flex-shrink-0">
        <div className="w-full max-w-2xl bg-slate-50 p-1.5 rounded-full shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)] border border-slate-200 flex items-center gap-2 hover:-translate-y-1 transition-all duration-300">
          <div className="flex-1 flex items-center gap-3 pl-6">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chiến dịch..."
              className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium py-2 text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-all active:scale-95"
          >
            Tìm ngay
          </button>
        </div>
      </form>

      {/* 3. Content Sections */}
      {hasContent ? (
        filteredSections.map((section, idx) => (
          <section key={idx} className="space-y-8">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-1">
                <div className={`flex items-center gap-2`}>
                  <section.icon className={`w-5 h-5 text-blue-500`} />
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-800">{section.title}</h2>
                </div>
                <div className="h-0.5 w-12 bg-blue-100 rounded-full overflow-hidden">
                  <div className={`h-full w-2/3 bg-blue-400 rounded-full`}></div>
                </div>
              </div>
              <Link href={section.link} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors group">
                Xem tất cả
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.data.slice(0, 4).map((c: any, i: number) => (
                <Link
                  key={c.id}
                  href={`/home/${c.id}`}
                  className={`group/card block h-full hover:-translate-y-1.5 transition-transform duration-300 
                    ${i >= 1 ? 'hidden sm:block' : ''} 
                    ${i >= 2 ? 'sm:hidden lg:block' : ''}`}
                >
                  <div className="relative h-full flex flex-col bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]">
                    <div className="relative aspect-[16/11] overflow-hidden bg-slate-50">
                      <img
                        src={c.image}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-1 space-y-4">
                      <h3 className="text-lg font-medium text-slate-800 leading-snug line-clamp-2 min-h-[3rem] group-hover/card:text-blue-600 transition-colors">
                        {c.title}
                      </h3>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-end">
                            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">Tiến độ</span>
                            <span className="text-sm font-semibold text-slate-700">
                              ${c.amountRaised.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(100, c.targetAmount ? (c.amountRaised / c.targetAmount) * 100 : 0)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }) : 'Sớm nhất'}
                          </div>
                          <div className="text-[10px] font-semibold text-blue-500 italic pb-0.5 border-b border-blue-100">
                            Chi tiết
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      ) : (
        /* 4. Empty State Message */
        <section className="relative transition-all flex-1 flex flex-col items-center justify-center mt-8 pb-12">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] bg-blue-50/40 blur-[100px] rounded-full -z-10"></div>
          <div className="max-w-2xl px-6 text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="text-6xl animate-bounce hover:scale-125 transition-transform duration-300 cursor-default drop-shadow-sm">
                😉
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium text-slate-700 leading-tight">
              Chưa có chiến dịch nào đang diễn ra, <br />
              <span className="italic text-blue-500/80">hãy quay lại sau nhé!</span>
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-slate-100"></div>
              <span className="text-[10px] font-medium italic text-slate-400">Kindlink Community</span>
              <div className="h-px w-8 bg-slate-100"></div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
