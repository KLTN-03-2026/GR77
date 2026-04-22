'use client';

import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  MegaphoneIcon,
  WalletIcon,
  CheckBadgeIcon,
  XCircleIcon,
  EyeIcon,
  UserCircleIcon,
  MapPinIcon,
  CalendarIcon,
  BanknotesIcon,
  ChartPieIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState, useMemo, useEffect } from 'react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  fundingGoalAmount: number;
  amountRaised: number;
  progress: number;
  coverImageUrl: string;
  locationText: string;
  startAt: string;
  endAt: string;
  creatorUser: {
    username: string;
    email: string;
  };
  donationsCount: number;
  favoritesCount: number;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminAccessToken');

      // Fetch Campaigns and Categories in parallel
      const [campaignsRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/campaigns/admin/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/categories`)
      ]);

      if (!campaignsRes.ok) throw new Error('Failed to fetch campaigns');
      const campaignsData = await campaignsRes.json();
      setCampaigns(campaignsData.items);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn DUYỆT chiến dịch này không? Nó sẽ được hiển thị công khai ngay lập tức.')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}` }
      });
      if (!res.ok) throw new Error('Failed to approve');
      await fetchData();
      setIsDetailOpen(false);
    } catch (err: any) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Vui lòng nhập lý do từ chối (lý do này sẽ được gửi đến người dùng):');
    if (!reason) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}`
        },
        body: JSON.stringify({ note: reason })
      });
      if (!res.ok) throw new Error('Failed to reject');
      await fetchData();
      setIsDetailOpen(false);
    } catch (err: any) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.creatorUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' ||
        campaign.category === selectedCategory ||
        (campaign as any).categoryRel?.name === selectedCategory;

      const matchesStatus = selectedStatus === 'All' || campaign.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [campaigns, searchTerm, selectedCategory, selectedStatus]);

  const stats = useMemo(() => {
    const totalRaised = campaigns.reduce((acc, c) => acc + c.amountRaised, 0);
    return {
      total: campaigns.length,
      totalRaised
    };
  }, [campaigns]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#7598C1] rounded-3xl px-6 py-4.5 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="bg-white/15 p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
            <MegaphoneIcon className="h-9 w-9 text-black" />
          </div>
          <div className="text-black">
            <p className="text-lg font-bold tracking-wide uppercase opacity-100">Tổng số chiến dịch</p>
            <h2 className="text-4xl font-black mt-1 tabular-nums">{stats.total}</h2>
          </div>
        </div>

        <div className="bg-[#7598C1] rounded-3xl px-6 py-4.5 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
          <div className="bg-white/15 p-3 rounded-2xl group-hover:bg-white/20 transition-colors">
            <WalletIcon className="h-9 w-9 text-black" />
          </div>
          <div className="text-black">
            <p className="text-lg font-bold tracking-wide uppercase opacity-100">Tổng tiền quyên góp</p>
            <h2 className="text-4xl font-black mt-1 tabular-nums">${stats.totalRaised.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm min-h-[500px]">
        {/* Filters Header */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#f8f9fa] border-b border-gray-300">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-[#2ba6e1]" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-64 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-600 font-medium placeholder:text-gray-400"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white cursor-pointer appearance-none min-w-[150px]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">Lĩnh vực: Tất cả</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>

            <div className="relative">
              <select className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white cursor-pointer appearance-none" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="All">Trạng thái: Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400"><ChevronDownIcon className="h-4 w-4" /></div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-300">
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300 text-center w-16">ID</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Chiến dịch</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Lĩnh vực</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Người tạo</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Trạng thái</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Mục tiêu</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Tiến độ</th>
                <th className="px-4 py-3 font-bold text-black text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center text-gray-400 italic font-medium">Đang đồng bộ dữ liệu chiến dịch...</td></tr>
              ) : filteredCampaigns.map((campaign, index) => (
                <tr key={campaign.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3 border-r border-gray-300 text-center font-bold text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-5 py-3 border-r border-gray-300"><span className="font-black text-gray-800 leading-snug">{campaign.title}</span></td>
                  <td className="px-4 py-3 border-r border-gray-300">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase">
                      {(campaign as any).categoryRel?.name || campaign.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 border-r border-gray-300 font-bold text-[11px] uppercase truncate max-w-[150px]">{campaign.creatorUser?.username || 'Unknown'}</td>
                  <td className="px-4 py-3 border-r border-gray-300">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight ${campaign.status === 'ACTIVE' ? 'bg-[#7BC712] text-black' :
                      campaign.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>{campaign.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-800 border-r border-gray-300 font-bold tabular-nums">${campaign.fundingGoalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 border-r border-gray-300">
                    <div className="flex flex-col gap-1.5 min-w-[100px]">
                      <span className="text-[10px] font-black text-[#E56C6C]">{Math.round(campaign.progress)}%</span>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-[#E56C6C] rounded-full transition-all duration-700" style={{ width: `${campaign.progress}%` }} /></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setSelectedCampaign(campaign); setIsDetailOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><EyeIcon className="w-5 h-5" /></button>
                      {campaign.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(campaign.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><CheckBadgeIcon className="w-5 h-5" /></button>
                          <button onClick={() => handleReject(campaign.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><XCircleIcon className="w-5 h-5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Detail Overlay */}
      {isDetailOpen && selectedCampaign && (
        <div className="fixed inset-0 z-[150] flex justify-end bg-black/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl h-screen shadow-2xl overflow-y-auto flex flex-col transform animate-in slide-in-from-right duration-500">
            <div className="relative h-72 bg-gray-900 overflow-hidden shrink-0">
              <img src={selectedCampaign.coverImageUrl || 'https://via.placeholder.com/1200x600'} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-6 left-8 right-8 text-white">
                <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase rounded-full mb-3 inline-block">{selectedCampaign.category}</span>
                <h2 className="text-4xl font-black tracking-tight leading-tight">{selectedCampaign.title}</h2>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"><XMarkIcon className="w-6 h-6" /></button>
            </div>

            <div className="p-10 flex-1 space-y-10">
              <div className="grid grid-cols-3 gap-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl"><UserCircleIcon className="w-6 h-6 text-[#7598C1]" /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Người tạo</p><p className="font-bold text-gray-900">{selectedCampaign.creatorUser?.username}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl"><MapPinIcon className="w-6 h-6 text-[#7598C1]" /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khu vực</p><p className="font-bold text-gray-900">{selectedCampaign.locationText}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl"><CalendarIcon className="w-6 h-6 text-[#7598C1]" /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời hạn</p><p className="font-bold text-gray-900">{new Date(selectedCampaign.endAt).toLocaleDateString()}</p></div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 border-b pb-2">Mô tả chiến dịch</h3>
                <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedCampaign.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                  <div className="flex items-center gap-3 mb-6"><BanknotesIcon className="w-5 h-5 text-green-600" /><h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Trạng thái tài chính</h4></div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end"><p className="text-4xl font-black text-gray-900">${selectedCampaign.amountRaised.toLocaleString()}</p><p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Đã quyên góp trên tổng số ${selectedCampaign.fundingGoalAmount.toLocaleString()}</p></div>
                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${selectedCampaign.progress}%` }} /></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                  <div className="flex items-center gap-3 mb-6"><ChartPieIcon className="w-5 h-5 text-blue-600" /><h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">Tương tác</h4></div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-white rounded-2xl shadow-sm"><p className="text-2xl font-black text-gray-900">{selectedCampaign.donationsCount}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Người quyên góp</p></div>
                    <div className="p-4 bg-white rounded-2xl shadow-sm"><p className="text-2xl font-black text-gray-900">{selectedCampaign.favoritesCount}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Người theo dõi</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t flex gap-6">
              <button onClick={() => handleReject(selectedCampaign.id)} disabled={isSubmitting || selectedCampaign.status !== 'PENDING'} className="flex-1 py-5 bg-white border-2 border-red-500 text-red-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 transition-all disabled:opacity-30">Từ chối</button>
              <button onClick={() => handleApprove(selectedCampaign.id)} disabled={isSubmitting || selectedCampaign.status !== 'PENDING'} className="flex-1 py-5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black shadow-xl shadow-blue-900/10 transition-all disabled:opacity-30">Phê duyệt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
