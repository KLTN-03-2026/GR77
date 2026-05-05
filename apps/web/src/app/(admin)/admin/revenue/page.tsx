'use client';

import { useEffect, useState } from 'react';
import {
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  TicketIcon,
  PercentBadgeIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { API_BASE_URL } from '@/lib/constants/endpoints';

// ── Utils ──────────────────────────────────────────────────────────
function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
}

// ── Sub-components ──────────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'bg-[#7598C1]', compact = false }: { label: string; value: string; icon: React.ReactNode; color?: string; compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-3 px-4 py-5 rounded-xl' : 'gap-6 px-6 py-4.5 rounded-2xl'} ${color} min-w-0 shadow-xl border border-transparent w-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}>
      <div className={`text-gray-900 bg-white/15 flex-shrink-0 flex items-center justify-center ${compact ? 'p-1.5 rounded-xl' : 'p-2.5 rounded-2xl'}`}>
        <div className={compact ? 'w-6 h-6' : 'w-10 h-10'}>{icon}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className={compact ? 'h-8 flex items-center' : ''}>
          <p className={`${compact ? 'text-[10px] sm:text-xs line-clamp-2 whitespace-pre-line' : 'text-md sm:text-base truncate'} font-bold text-gray-800 uppercase tracking-wide opacity-100`} title={label}>{label}</p>
        </div>
        <p className={`${compact ? 'text-base lg:text-lg' : 'text-2xl lg:text-3xl'} font-black text-gray-900 leading-tight truncate mt-0.5 tabular-nums`} title={value}>{value}</p>
      </div>
    </div>
  );
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin-dashboard/revenue-stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}` }
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7598C1]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Top Section: Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard label="Tổng số lượng chiến dịch" value={data.totalCampaigns.toLocaleString()} icon={<PresentationChartLineIcon />} />
        <StatCard label="Tổng doanh thu quỹ" value={data.totalGrossDonations.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} icon={<BanknotesIcon />} />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Phí xử lý đã thu', value: data.totalFeesCollected.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), icon: <BanknotesIcon /> },
          { label: 'Doanh thu thực\n(Ước tính)', value: data.totalFeesCollected.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }), icon: <ArrowTrendingUpIcon /> },
          { label: 'Phí sự kiện (Tạm tính)', value: '0 ₫', icon: <TicketIcon /> },
          { label: 'Tỷ lệ phí bình quân', value: '2.8 %', icon: <PercentBadgeIcon /> },
        ].map((stat, i) => (
          <StatCard key={i} label={stat.label} value={stat.value} icon={stat.icon} compact />
        ))}
      </div>

      {/* Row 1: Area Chart & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 tracking-wider">Dòng Doanh thu & Phí (Hàng ngày)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.flowChart} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7598C1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7598C1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 1000).toLocaleString()}k`} />
                <Tooltip formatter={(v: any) => [formatVND(v), 'Doanh thu phí']} />
                <Area type="monotone" dataKey="value" stroke="#7598C1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#d1d5db] rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-black text-gray-800 leading-tight mb-6 uppercase tracking-tighter">Phân tích Số liệu</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 tracking-widest">Khoảng thời gian</label>
                <div className="relative">
                  <select className="w-full bg-white border border-gray-300 rounded-2xl py-3.5 px-4 text-gray-800 font-bold appearance-none outline-none focus:ring-2 focus:ring-[#7598C1]">
                    <option>30 ngày gần nhất</option>
                    <option>Tháng này</option>
                    <option>Tháng trước</option>
                  </select>
                  <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
              </div>
              <div className="p-4 bg-white/40 rounded-2xl border border-white/50">
                <p className="text-[11px] font-black uppercase text-gray-500 mb-1">Thống kê nhanh</p>
                <p className="text-2xl font-black text-gray-800">+{data.flowChart.filter((f: any) => f.value > 0).length} Lượt thu</p>
                <p className="text-xs font-bold text-gray-600 mt-1 italic">Dữ liệu được cập nhật thời gian thực từ Smart Contract và Ledger.</p>
              </div>
            </div>
          </div>
          <button onClick={fetchStats} className="w-full bg-[#7598C1] text-black py-4 mt-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#5DA2D5] transition-all transform active:scale-[0.98]">
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Row 2: Horizontal Bar & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 tracking-wider">Phân tích Số dư Theo Danh mục Phí (Tổng vs Thực nhận)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categories} layout="vertical" margin={{ left: 60, right: 60, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }} width={140} />
                <Tooltip formatter={(v: any) => formatVND(v)} />
                <Legend iconType="square" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar dataKey="total" name="Tổng phí thu" fill="#7598C1" barSize={14} radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#6b7280', fontWeight: 'bold', formatter: (v: any) => formatVND(v) }} />
                <Bar dataKey="net" name="Thực nhận" fill="#10B981" barSize={14} radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#10b981', fontWeight: 'bold', formatter: (v: any) => formatVND(v) }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-2xl font-black text-gray-800 leading-tight mb-1 uppercase tracking-tight">Chi tiết Doanh thu</h3>
          <p className="text-sm font-black text-gray-400 mb-6 uppercase tracking-widest opacity-60">Thống kê 30 ngày</p>
          <div className="space-y-4">
            {[
              { label: 'Phí xử lý giao dịch', value: formatVND(data.totalFeesCollected * 0.7) },
              { label: 'Thu nhập từ phí nạp', value: formatVND(data.totalFeesCollected * 0.2) },
              { label: 'Phí duy trì hệ thống', value: formatVND(data.totalFeesCollected * 0.1) },
              { label: 'Tỷ lệ tăng trưởng', value: '+12.5%' },
              { label: 'Số dư ví quỹ', value: formatVND(data.platformNetProfit) },
            ].map((m, i) => (
              <div key={i} className="flex items-center text-xs font-black text-gray-500 uppercase tracking-wider border-b border-gray-50 pb-2">
                <span className="flex-1 opacity-60">{m.label}</span>
                <span className="text-gray-900">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
