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

const TEAL = '#0891B2';

const HERO_IMAGES = [
  '/images/background/banner-top.svg',
  '/images/background/background-login.svg',
  '/images/background/banner-top3.svg',
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
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 opacity-20" style={{ backgroundColor: TEAL }}></div>
          <div className="relative rounded-full h-12 w-12 border-4 border-t-transparent animate-spin" style={{ borderColor: `${TEAL}40`, borderTopColor: 'transparent', borderRightColor: TEAL }}></div>
        </div>
      </div>
    );
  }

  const activeSections = [
    { title: 'Trending Campaigns', data: trendingCampaigns, icon: ArrowTrendingUpIcon, link: '/campaigns' },
    { title: 'Managed by You', data: myCampaigns, icon: BriefcaseIcon, link: '/creator/campaigns' },
    { title: 'Your Communities', data: joinedCampaigns, icon: UserGroupIcon, link: '/joined' },
    { title: 'Saved for Later', data: favoriteCampaigns, icon: HeartIcon, link: '/favorites' },
    { title: 'Recently Viewed', data: activityHistory, icon: ClockIcon, link: '/activity' },
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
    <div className={`w-full ${hasContent ? 'space-y-12' : 'min-h-[60vh] flex flex-col justify-between'}`}>

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

      <form onSubmit={handleSearch} className="flex justify-center relative z-20 flex-shrink-0 mt-6">
        <div className="w-full max-w-2xl bg-white p-1.5 rounded-full border border-gray-200 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 pl-5">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-bold py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 text-white text-xs font-black rounded-full hover:opacity-90 transition-all active:scale-95"
            style={{ backgroundColor: TEAL }}
          >
            Search
          </button>
        </div>
      </form>

      {/* 3. Content Sections */}
      {hasContent ? (
        filteredSections.map((section, idx) => (
          <section key={idx} className="space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <section.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: TEAL }} />
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{section.title}</h2>
                </div>
                <div className="h-1 w-14 rounded-full overflow-hidden" style={{ backgroundColor: `${TEAL}20` }}>
                  <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: TEAL }}></div>
                </div>
              </div>
              <Link href={section.link} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-cyan-600 transition-colors group">
                View all
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {section.data.slice(0, 4).map((c: any, i: number) => {
                const progress = c.targetAmount ? Math.min(100, (c.amountRaised / c.targetAmount) * 100) : 0;
                return (
                  <Link
                    key={c.id}
                    href={`/home/${c.id}`}
                    className={`group/card block h-full transition-transform duration-300 hover:scale-[1.02]
                      ${i >= 1 ? 'hidden sm:block' : ''}
                      ${i >= 2 ? 'sm:hidden lg:block' : ''}`}
                  >
                    <div className="relative h-full flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 overflow-hidden hover:border-cyan-200">
                      <div className="relative aspect-[16/11] overflow-hidden bg-gray-50">
                        <img
                          src={c.image}
                          alt={c.title}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                      </div>

                      <div className="p-4 flex flex-col flex-1 space-y-3">
                        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem] group-hover/card:text-cyan-600 transition-colors">
                          {c.title}
                        </h3>

                        <div className="space-y-2.5 mt-auto">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Raised</span>
                              <span className="text-[11px] font-bold" style={{ color: TEAL }}>
                                {c.amountRaised.toLocaleString()} VND
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                  width: `${progress}%`,
                                  background: `linear-gradient(90deg, #47c9e5, ${TEAL})`
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                            <CalendarIcon className="w-3.5 h-3.5" style={{ color: TEAL }} />
                            {c.startDate ? new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Coming soon'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        /* 4. Empty State Message */
        <section className="relative transition-all flex-1 flex flex-col items-center justify-center mt-8 pb-12">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] blur-[100px] rounded-full -z-10" style={{ backgroundColor: `${TEAL}10` }}></div>
          <div className="max-w-2xl px-6 text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="text-6xl animate-bounce hover:scale-125 transition-transform duration-300 cursor-default drop-shadow-sm">
                😉
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 leading-tight">
              No campaigns available right now, <br />
              <span className="italic" style={{ color: TEAL }}>check back soon!</span>
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gray-200"></div>
              <span className="text-[10px] font-bold italic text-gray-400">Kindlink Community</span>
              <div className="h-px w-8 bg-gray-200"></div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
