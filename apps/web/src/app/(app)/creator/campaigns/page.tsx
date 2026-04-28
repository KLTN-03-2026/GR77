'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    EllipsisVerticalIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
    PieChart, Pie
} from 'recharts';

function formatVND(value: number): string {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
    return value.toLocaleString('vi-VN');
}

// Custom Tooltip for Area Chart
const AreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-2 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-center">
                <span className="text-gray-900 font-bold text-sm">{formatVND(payload[0].value)} ₫</span>
                <span className="text-gray-400 text-xs mt-0.5">{label}</span>
            </div>
        );
    }
    return null;
};

const ChartSkeleton = () => (
    <div className="h-full w-full flex items-end gap-2 px-2 animate-pulse">
        {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-100 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
    </div>
);

interface ChartStats {
    areaChart: { name: string; value: number }[];
    barChart: { name: string; active: number; pending: number }[];
    totalRaised: number;
    totalGoal: number;
    campaignCount: number;
}

export default function CreatorCampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [chartStats, setChartStats] = useState<ChartStats | null>(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/me/list`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem('accessToken');
                        router.push('/login');
                        return;
                    }
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch campaigns');
                }

                const data = await res.json();
                setCampaigns(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, [router]);

    useEffect(() => {
        const fetchStats = async () => {
            setIsStatsLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/me/stats`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!res.ok) return;
                const data = await res.json();
                setChartStats(data);
            } catch (e) {
                console.error('Failed to fetch chart stats', e);
            } finally {
                setIsStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="w-full pb-10">
            {/* Header section */}
            <div className="mb-2 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                    <DocumentTextIcon className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-500" />
                    My Campaigns
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 ml-7 sm:ml-9">Quản lý các chiến dịch của bạn</p>
            </div>

            {/* Search + Table Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                        <div className="relative w-full max-w-lg">
                            <input
                                type="text"
                                className="w-full h-[25px] sm:h-[35px] bg-gray-50 border border-gray-200 rounded-full pl-6 pr-12 text-[11px] sm:text-sm text-gray-900 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-300"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 font-bold" strokeWidth={2.5} />
                        </div>
                    </div>

                    <Link href="/creator/campaigns/new" className="inline-flex justify-center items-center bg-white hover:bg-[#2b9ec5]/10 border-2 border-[#2b9ec5] text-[#2b9ec5] px-8 py-2.5 rounded-full text-sm font-black transition-colors w-full sm:w-auto gap-2">
                        + Add campaign
                    </Link>
                </div>

                {/* Table or Empty State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-24 text-red-500 font-medium text-lg border-2 border-dashed border-red-200 rounded-2xl bg-red-50">
                        {error}
                    </div>
                ) : filteredCampaigns.length > 0 ? (
                    <>
                        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white text-gray-800">
                            <table className="w-full min-w-[1000px] table-fixed text-center text-[13px] font-medium border-collapse">
                                <thead className="bg-[#7fa8e8] text-white">
                                    <tr>
                                        <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[5%]">ID</th>
                                        <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[28%]">Name</th>
                                        <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[12%]">Created at</th>
                                        <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[15%]">Goal (VND)</th>
                                        <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[20%]">Address</th>
                                        <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[10%]">Approval</th>
                                        <th className="py-3.5 px-4 font-bold w-[10%]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCampaigns.map((camp, index) => {
                                        const globalIndex = (currentPage - 1) * itemsPerPage + index;
                                        return (
                                        <tr
                                            key={camp.id}
                                            onClick={() => router.push(`/creator/campaigns/${camp.id}?idx=${globalIndex + 1}`)}
                                            className="bg-[#fcf4f6] border-b border-white last:border-b-0 h-[4.5rem] hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            <td className="border-r border-white font-bold">#{globalIndex + 1}</td>
                                            <td className="border-r border-white px-4 text-left overflow-hidden">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-white shadow-sm">
                                                        {camp.coverImageUrl ? (
                                                            <img src={camp.coverImageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold bg-gray-100">
                                                                No Pic
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <div className="font-bold truncate text-gray-900">{camp.title}</div>
                                                        <div className="text-[10px] text-gray-400 truncate">{camp.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-r border-white">{new Date(camp.createdAt).toLocaleDateString()}</td>
                                            <td className="border-r border-white font-bold text-gray-800">{Number(camp.fundingGoalAmount).toLocaleString()}</td>
                                            <td className="border-r border-white px-4 text-left truncate text-gray-700">{camp.locationText}</td>
                                            <td className="border-r border-white px-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${camp.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                                                    camp.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {camp.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors group"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/creator/campaigns/${camp.id}/edit`);
                                                    }}
                                                    title="Edit Campaign"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-gray-600 mx-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex justify-center items-center py-24 mb-14 text-slate-500 font-medium text-lg border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                        No campaigns have been created yet.
                    </div>
                )}
            </div>

            {/* Chart Donate Box */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mt-6">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-none">Chart Donate</h2>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Tổng tiền donate vào campaigns của bạn – 7 ngày qua</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-[#9fd3f2] text-[#6bbceb] rounded-[10px] text-xs font-bold hover:bg-blue-50 transition-colors">
                        <ArrowDownTrayIcon className="h-4 w-4" strokeWidth={2.5} />
                        Save Report
                    </button>
                </div>

                <div className="h-[240px] w-full">
                    {isStatsLoading ? (
                        <ChartSkeleton />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartStats?.areaChart ?? []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#81cbf1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#81cbf1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                                    dy={15}
                                />
                                <YAxis
                                    hide={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 600 }}
                                    tickFormatter={(v) => formatVND(v)}
                                    width={48}
                                />
                                <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#81cbf1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    activeDot={{ r: 6, fill: '#81cbf1', stroke: '#ffffff', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Bottom Row Box */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mt-6 flex flex-col lg:flex-row items-stretch gap-8 lg:gap-0">

                {/* Campaigns Map Section */}
                <div className="flex-1 flex flex-col pb-4 lg:pb-0 lg:pr-10 border-b lg:border-b-0 lg:border-r border-gray-100">
                    <div className="flex justify-between items-center mb-10 mt-2">
                        <h2 className="text-base font-bold text-gray-900">Campaigns Map</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-[#ffc42e]"></span>
                                    Active
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-[#ff545e]"></span>
                                    Pending
                                </span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="h-[200px] w-full mt-auto">
                        {isStatsLoading ? (
                            <ChartSkeleton />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartStats?.barChart ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="35%">
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value, name) => [value, name === 'active' ? 'Active' : 'Pending']} />
                                    <Bar dataKey="active" name="active" radius={[6, 6, 6, 6]} barSize={8} fill="#ffc42e" />
                                    <Bar dataKey="pending" name="pending" radius={[6, 6, 6, 6]} barSize={8} fill="#ff545e" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Total Raised Section */}
                <div className="flex-1 flex flex-col justify-center items-center lg:pl-10 pt-4 lg:pt-0">
                    {isStatsLoading ? (
                        <div className="w-[180px] h-[180px] rounded-full bg-gray-100 animate-pulse" />
                    ) : (() => {
                        const raised = chartStats?.totalRaised ?? 0;
                        const goal = chartStats?.totalGoal ?? 0;
                        const raisedPct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                        const remainingPct = 100 - raisedPct;
                        const donutData = [
                            { name: 'Raised', value: raisedPct || 1 },
                            { name: 'Remaining', value: remainingPct > 0 ? remainingPct : 0 },
                        ];
                        return (
                            <div className="relative w-[180px] h-[180px]">
                                <div className="absolute inset-0 rounded-full bg-blue-50/20 blur-xl"></div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={68}
                                            outerRadius={90}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={40}
                                        >
                                            <Cell fill="#dff0fa" />
                                            <Cell fill="#f6f9fc" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl sm:text-2xl font-black text-[#fed13f] drop-shadow-sm tracking-wide">
                                        {formatVND(raised)}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-bold mt-0.5">VND</span>
                                </div>
                            </div>
                        );
                    })()}
                    <h3 className="text-gray-900 font-extrabold text-xs tracking-wide uppercase mt-6">Total Raised</h3>
                    {!isStatsLoading && chartStats && (
                        <p className="text-[10px] text-gray-400 mt-1">
                            {chartStats.campaignCount} campaign{chartStats.campaignCount !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
