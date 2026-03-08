'use client';

import React from 'react';
import Link from 'next/link';
import {
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    EllipsisVerticalIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
    PieChart, Pie
} from 'recharts';

const areaData = [
    { name: 'Sunday', value: 200 },
    { name: 'Monday', value: 400 },
    { name: 'Tuesday', value: 300 },
    { name: 'Wednesday', value: 650 },
    { name: 'Thursday', value: 400 },
    { name: 'Friday', value: 458 },
    { name: 'Saturday', value: 500 },
];

const barData = [
    { name: 'Sun', value: 60, isRed: true },
    { name: 'Sun ', value: 80, isRed: false },
    { name: 'Sun  ', value: 40, isRed: true },
    { name: 'Sun   ', value: 60, isRed: false },
    { name: 'Sun    ', value: 50, isRed: true },
    { name: 'Sun     ', value: 50, isRed: false },
    { name: 'Sun      ', value: 60, isRed: true },
];

const donutData = [
    { name: 'Raised', value: 80 },
    { name: 'Remaining', value: 20 },
];

// Custom Tooltip for Area Chart
const AreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white px-4 py-2 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col items-center">
                <span className="text-gray-900 font-bold text-sm">{payload[0].value} Order</span>
                <span className="text-gray-400 text-xs mt-0.5">Oct 10th 2010</span>
            </div>
        );
    }
    return null;
};

export default function CreatorCampaignsPage() {
    // This is currently empty, simulating no campaigns. Change this array to test the table.
    const campaigns: any[] = [];

    return (
        <div className="w-full max-w-5xl mx-auto pb-10">
            {/* Header section */}
            <div className="mb-6">
                <h1 className="text-xl font-extrabold text-[#1a1a1a] mb-5 tracking-tight">My Campaigns</h1>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                        <div className="relative w-full max-w-lg">
                            <input
                                type="text"
                                className="w-full bg-[#f1f1f1] border border-transparent rounded-full py-2.5 pl-6 pr-12 text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400 font-medium"
                                placeholder=""
                            />
                            <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 font-bold" strokeWidth={2.5} />
                        </div>
                        <span className="text-gray-900 font-black text-xl whitespace-nowrap min-w-[50px] tracking-widest">-- : --</span>
                    </div>

                    <Link href="/creator/campaigns/new" className="inline-flex justify-center items-center bg-gradient-to-r from-[#8cc9f5] to-[#73bdf2] hover:opacity-90 text-white px-10 py-2 rounded-xl text-sm font-bold shadow-sm transition-opacity w-full sm:w-auto">
                        Add
                    </Link>
                </div>
            </div>

            {/* Table or Empty State */}
            {campaigns.length > 0 ? (
                <>
                    <div className="overflow-x-auto rounded-t-xl rounded-b-xl shadow-sm border border-gray-100 mb-8 bg-white">
                        <table className="w-full text-center text-sm font-medium">
                            <thead className="bg-[#7fa8e8] text-white">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[5%]">ID</th>
                                    <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[20%]">Name</th>
                                    <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[15%]">Created at</th>
                                    <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[15%]">Progress</th>
                                    <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[15%]">Address</th>
                                    <th className="py-3.5 px-4 font-bold border-r border-[#96baf0] last:border-r-0 w-[15%]">Approval Status</th>
                                    <th className="py-3.5 px-4 font-bold w-[15%]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, index) => (
                                    <tr key={index} className="bg-[#fcf4f6] border-b border-white last:border-b-0 h-[4.5rem]">
                                        <td className="border-r border-white"></td>
                                        <td className="border-r border-white"></td>
                                        <td className="border-r border-white"></td>
                                        <td className="border-r border-white"></td>
                                        <td className="border-r border-white"></td>
                                        <td className="border-r border-white"></td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2.5 mb-14">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#3bc8ed] shadow-[0_2px_8px_-2px_rgba(59,200,237,0.5)] text-white font-bold text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bae9f7] bg-white text-[#3bc8ed] font-bold text-xs hover:bg-gray-50 transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bae9f7] bg-white text-[#3bc8ed] font-bold text-xs hover:bg-gray-50 transition-colors">3</button>
                        <span className="text-[#3bc8ed] tracking-[0.2em] font-bold text-sm px-1.5 pt-1">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bae9f7] bg-white text-[#3bc8ed] font-bold text-xs hover:bg-gray-50 transition-colors">n</button>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center py-24 mb-14 text-slate-500 font-medium text-lg border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    No campaigns have been created yet.
                </div>
            )}

            {/* Main Content Areas Wrapper */}
            <div className="flex flex-col w-full px-2 sm:px-6 mb-10">

                {/* Chart Donate Box */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 w-full max-w-4xl mx-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-none">Chart Donate</h2>
                            <p className="text-xs text-gray-400 mt-2 font-medium">Lorem ipsum dolor sit amet, consectetur adip</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-[#9fd3f2] text-[#6bbceb] rounded-[10px] text-xs font-bold hover:bg-blue-50 transition-colors">
                            <ArrowDownTrayIcon className="h-4 w-4" strokeWidth={2.5} />
                            Save Report
                        </button>
                    </div>

                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
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
                    </div>
                </div>

                {/* Bottom Row Box */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col lg:flex-row items-stretch w-full max-w-4xl mx-auto gap-8 lg:gap-0">

                    {/* Campaigns Map Section */}
                    <div className="flex-1 flex flex-col pb-4 lg:pb-0 lg:pr-10 border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div className="flex justify-between items-center mb-10 mt-2">
                            <h2 className="text-base font-bold text-gray-900">Campaigns Map</h2>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1.5 text-[10px] font-bold border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50">
                                    Weekly
                                    <ChevronDownIcon className="h-2.5 w-2.5 text-red-400 stroke-[3]" />
                                </button>
                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="h-[200px] w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={0} barCategoryGap="30%">
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
                                        ticks={[0, 20, 40, 60, 80]}
                                    />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={8}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.isRed ? '#ff545e' : '#ffc42e'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Total Raised Section */}
                    <div className="flex-1 flex flex-col justify-center items-center lg:pl-10 pt-4 lg:pt-0">
                        <div className="relative w-[180px] h-[180px]">
                            {/* Inner custom shadows layer for the donut could reside under the SVG */}
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
                                        cornerRadius={40} // gives a rounded effect to the pie ends if any
                                    >
                                        <Cell fill="#dff0fa" />
                                        <Cell fill="#f6f9fc" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-[#fed13f] drop-shadow-sm tracking-wide">80M $</span>
                            </div>
                        </div>
                        <h3 className="text-gray-900 font-extrabold text-xs tracking-wide uppercase mt-6">Total Raised</h3>
                    </div>

                </div>
            </div>

        </div>
    );
}
