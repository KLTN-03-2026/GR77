'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ── INTERFACES ─────────────────────────────────────────────────────────

export interface DonationData {
  month: string;
  value: number;
}

export interface FundDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface ActivityLogItem {
  id: string; // Add ID for API matching instead of map index
  username: string;
  email: string;
  avatarUrl?: string;
  activity: string;
  date: string; 
  type: string;
}

function getPageNumbers(current: number, total: number) {
  const delta = 1;
  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];
  let last: number | undefined;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  for (const i of range) {
    if (last !== undefined && typeof i === 'number' && i - last > 1) rangeWithDots.push('...');
    rangeWithDots.push(i);
    if (typeof i === 'number') last = i;
  }
  return rangeWithDots;
}

// ── STAT CARD ─────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-6 bg-[#7598C1] rounded-3xl px-6 py-4.5 min-w-0 shadow-xl border border-[#7598C1] w-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="text-gray-900 bg-white/15 p-2.5 rounded-2xl flex-shrink-0 text-3xl sm:text-4xl">{icon}</div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-800 uppercase tracking-wide opacity-100 truncate">{label}</p>
        <p className="text-4xl font-black text-gray-900 leading-tight truncate mt-1">{value}</p>
      </div>
    </div>
  );
}

// ── AVATAR PLACEHOLDER ────────────────────────────────────────────────
function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  // Can use avatarUrl directly here if provided from BE
  return (
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 overflow-hidden">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <svg className="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      )}
    </div>
  );
}


// ── MAIN PAGE ─────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  const [stats, setStats] = useState({ totalUsers: 0, activeCampaigns: 0, totalDonationAmount: 0 });
  const [donationData, setDonationData] = useState<DonationData[]>([]);
  const [fundDistribution, setFundDistribution] = useState<FundDistributionData[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('adminAccessToken');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      try {
        const [statsRes, growthRes, fundRes] = await Promise.all([
          fetch(`${apiUrl}/admin-dashboard/stats`, { headers }),
          fetch(`${apiUrl}/admin-dashboard/donation-growth`, { headers }),
          fetch(`${apiUrl}/admin-dashboard/fund-allocation`, { headers })
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (growthRes.ok) setDonationData(await growthRes.json());
        if (fundRes.ok) setFundDistribution(await fundRes.json());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('adminAccessToken');
      if (!token) return;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      try {
        const url = filter ? `${apiUrl}/admin-dashboard/activity-log?filter=${filter}` : `${apiUrl}/admin-dashboard/activity-log`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          setActivityLog(await res.json());
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error fetching activity log:', error);
      }
    };
    fetchLogs();
  }, [filter]);

  const totalPages = Math.ceil(activityLog.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return activityLog.slice(start, start + itemsPerPage);
  }, [activityLog, currentPage]);

  return (
    <div className="space-y-5">

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          icon={
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          }
        />
        <StatCard
          label="Chiến dịch hoạt động"
          value={stats.activeCampaigns.toLocaleString()}
          icon={
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
            </svg>
          }
        />
        <StatCard
          label="Tổng quyên góp"
          value={`${stats.totalDonationAmount.toLocaleString()} đ`}
          icon={
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
          }
        />
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Donation Growth – Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Tăng trưởng quyên góp</h2>
              <p className="text-xs text-gray-400">Biểu đồ đường</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
            </svg>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={donationData} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="donationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#00AEEF" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toLocaleString()}k`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v) => [`${Number(v).toLocaleString()} đ`, 'Quyên góp']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00AEEF"
                strokeWidth={2.5}
                fill="url(#donationGrad)"
                dot={{ r: 3, fill: '#00AEEF', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funds Distribution – Donut Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">Phân bổ quỹ</h2>
          <p className="text-xs text-gray-400 mb-6">Biểu đồ tròn theo danh mục</p>
          {fundDistribution.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={fundDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {fundDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${Number(v)}%`]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                <div className="flex flex-col gap-1.5 mt-4 text-xs max-h-[160px] overflow-y-auto">
                  {fundDistribution.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-600 truncate">{d.name}</span>
                      <span className="ml-auto font-semibold text-gray-700">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu phân bổ</div>
          )}
        </div>
      </div>

      {/* ── RECENT ACTIVITY LOG ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header button and filter */}
        <div className="px-5 pt-4 pb-2 flex justify-between items-center bg-white border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            Nhật ký hoạt động gần đây
          </h2>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7598C1] text-gray-700 bg-white"
          >
            <option value="">Tất cả hoạt động</option>
            <option value="1">Đã đăng ký</option>
            <option value="2">Đã tạo chiến dịch</option>
            <option value="3">Xác minh CCCD</option>
            <option value="4">Đã quyên góp</option>
            <option value="5">Đã rút tiền</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-700 w-16">STT</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-700 w-64">Người dùng</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Hoạt động</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? paginatedLogs.map((row, index) => {
                const getRowColor = (type: string) => {
                  switch (type) {
                    case 'REGISTER': return 'bg-blue-50/60 hover:bg-blue-100/60';
                    case 'CAMPAIGN': return 'bg-green-50/60 hover:bg-green-100/60';
                    case 'EKYC': return 'bg-yellow-50/60 hover:bg-yellow-100/60';
                    case 'DONATION': return 'bg-pink-50/60 hover:bg-pink-100/60';
                    case 'WITHDRAWAL': return 'bg-gray-100/60 hover:bg-gray-200/60';
                    default: return 'hover:bg-gray-50';
                  }
                };
                
                const dateStr = new Date(row.date).toLocaleString('vi-VN', { 
                  hour: '2-digit', minute: '2-digit', 
                  day: '2-digit', month: '2-digit', year: 'numeric' 
                });

                return (
                <tr key={row.id} className={`border-b border-gray-100 transition-colors ${getRowColor(row.type)}`}>
                  <td className="px-5 py-3 font-medium text-gray-700">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={row.username} avatarUrl={row.avatarUrl} />
                      <div>
                        <p className="font-semibold text-gray-800 leading-tight truncate max-w-[150px]">{row.username}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">Email : {row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{row.activity}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dateStr}</td>
                </tr>
              )}) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">Không có dữ liệu phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 py-6 border-t border-gray-100">
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                typeof item === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(Math.max(1, Math.min(item, totalPages)))}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl font-black text-sm transition-all transform active:scale-95 ${currentPage === item
                      ? 'bg-[#7598C1] text-black shadow-lg scale-110'
                      : 'border border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-[#7598C1] hover:text-[#7598C1] bg-white'
                      }`}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={idx} className="px-2 text-gray-400 font-black">{item}</span>
                )
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

