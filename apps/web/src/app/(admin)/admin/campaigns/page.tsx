'use client';

import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  MegaphoneIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';

const mockCampaigns = [
  {
    id: '1',
    title: 'Quỹ áo ấm cho trẻ em vùng cao',
    category: 'Charity',
    status: 'Active',
    targetAmount: 120000,
    amountRaised: 55000,
    progress: 55,
  },
  {
    id: '2',
    title: 'Nước sạch cho đồng bào miền Trung',
    category: 'Health',
    status: 'Pending',
    targetAmount: 150000,
    amountRaised: 30000,
    progress: 20,
  },
  {
    id: '3',
    title: 'Học bổng thắp sáng ước mơ',
    category: 'Education',
    status: 'Completed',
    targetAmount: 100000,
    amountRaised: 100000,
    progress: 100,
  },
  { id: '4', title: 'Máy tính cho em', category: 'Education', status: 'Active', targetAmount: 200000, amountRaised: 85000, progress: 42.5 },
  { id: '5', title: 'Bữa ăn 0 đồng', category: 'Charity', status: 'Active', targetAmount: 50000, amountRaised: 12000, progress: 24 },
  { id: '6', title: 'Xây cầu vùng cao', category: 'Charity', status: 'Pending', targetAmount: 300000, amountRaised: 0, progress: 0 },
  { id: '7', title: 'Tết ấm tình thương', category: 'Charity', status: 'Completed', targetAmount: 80000, amountRaised: 82000, progress: 100 },
];

export default function AdminCampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Logic filter dynamic
  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || campaign.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || campaign.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#7598C1] rounded-3xl px-6 py-4.5 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="bg-white/15 p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
            <MegaphoneIcon className="h-9 w-9 text-black" />
          </div>
          <div className="text-black">
            <p className="text-lg font-bold tracking-wide uppercase opacity-100">Total Campaigns</p>
            <h2 className="text-4xl font-black mt-1 tabular-nums">87</h2>
          </div>
        </div>

        <div className="bg-[#7598C1] rounded-3xl px-6 py-4.5 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="bg-white/15 p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
            <WalletIcon className="h-9 w-9 text-black" />
          </div>
          <div className="text-black">
            <p className="text-lg font-bold tracking-wide uppercase opacity-100">Totals Funds Raised</p>
            <h2 className="text-4xl font-black mt-1 tabular-nums">$6,750</h2>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm min-h-[500px]">
        {/* Filters Header (Toolbar) */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#f8f9fa] border-b border-gray-300">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-[#2ba6e1]" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-64 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-600 font-medium placeholder:text-gray-400"
                placeholder="Search Campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">Category: All</option>
                <option value="Charity">Charity</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          <button className="ml-auto bg-[#7598C1] hover:bg-[#5DA2D5] text-black px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm inline-flex items-center">
            <PlusIcon className="h-4 w-4 mr-1.5 stroke-[2.5]" />
            Add Campaigns
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredCampaigns.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-300">
                  <th className="px-5 py-3 font-bold text-black border-r border-gray-300">Campaigns title</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Category</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Target Amount</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Amount Raised</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Progress (%)</th>
                  <th className="px-4 py-3 font-bold text-black text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors group cursor-default">
                    <td className="px-5 py-3 border-r border-gray-300">
                      <span className="font-medium text-gray-800 leading-snug">{campaign.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 border-r border-gray-300">
                      <span className="font-medium">{campaign.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 border-r border-gray-300">
                      <span className="font-bold">${campaign.targetAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 border-r border-gray-300">
                      <span className="font-bold">${campaign.amountRaised.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <div className="flex justify-start px-0.5">
                          <span className="text-[12px] font-black text-[#E56C6C]">{campaign.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200/70 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E56C6C] rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 font-bold tracking-widest cursor-pointer hover:text-gray-900 select-none">
                      ...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <MagnifyingGlassIcon className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">No campaigns found matching your filters</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedStatus('All'); }}
                className="mt-4 text-[#7598C1] font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
