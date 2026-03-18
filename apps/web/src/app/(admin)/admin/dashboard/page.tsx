'use client';

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
  name: string;
  email: string;
  activity: string;
  time: string; // This could be createdAt from BE mapped to relative time
  status: 'Pending' | 'Approved' | 'Rejected';
}

// ── DATA ─────────────────────────────────────────────────────────────
const donationData: DonationData[] = [
  { month: 'JAN', value: 1200 },
  { month: 'FEB', value: 1800 },
  { month: 'MAR', value: 1600 },
  { month: 'APR', value: 2400 },
  { month: 'MAY', value: 5000 },
];

const fundDistribution: FundDistributionData[] = [
  { name: 'Education', value: 35, color: '#F76C6C' },
  { name: 'Health', value: 25, color: '#7BC712' },
  { name: 'Environment', value: 20, color: '#5DA2D5' },
  { name: 'Community', value: 20, color: '#FAED26' },
];

const activityLog: ActivityLogItem[] = [
  { id: '1', name: 'Hiếu', email: 'hieu@gmail.com', activity: 'Registered', time: '2m ago', status: 'Pending' },
  { id: '2', name: 'Tiên', email: 'tien@gmail.com', activity: 'Donate to Campaigns', time: '10m ago', status: 'Approved' },
  { id: '3', name: 'Trà My', email: 'my@gmail.com', activity: 'Donate to Campaigns', time: '8m ago', status: 'Approved' },
  { id: '4', name: 'An', email: 'an@gmail.com', activity: 'Registered', time: '2m ago', status: 'Pending' },
  { id: '5', name: 'Vương', email: 'vuong@gmail.com', activity: 'Registered', time: '2m ago', status: 'Pending' },
];

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

// ── STATUS BADGE ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const isApproved = status === 'Approved';
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold text-black ${isApproved ? 'bg-[#7BC712]' : 'bg-[#FAED26]'
        }`}
    >
      {status}
    </span>
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

// ── DONUT LEGEND ──────────────────────────────────────────────────────
function DonutLegend() {
  return (
    <div className="flex flex-col gap-1.5 mt-4 text-xs">
      {fundDistribution.map((d) => (
        <div key={d.name} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
          <span className="text-gray-600">{d.name}</span>
          <span className="ml-auto font-semibold text-gray-700">{d.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  return (
    <div className="space-y-5">

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value="5,240"
          icon={
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          }
        />
        <StatCard
          label="Active Campaigns"
          value="87"
          icon={
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
            </svg>
          }
        />
        <StatCard
          label="Total Raised"
          value="5,240"
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
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Donation growth</h2>
              <p className="text-xs text-gray-400">Line chart</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 mt-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
            </svg>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={donationData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="donationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#00AEEF" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Donated']}
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
          <h2 className="text-lg font-bold text-gray-800">Funds Distribution</h2>
          <p className="text-xs text-gray-400 mb-2">Pie chart</p>
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
              <DonutLegend />
            </div>
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY LOG ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header button */}
        <div className="px-5 pt-4 pb-2">
          <button className="px-4 py-1.5 rounded-lg border border-transparent text-sm font-semibold text-black bg-[#7598C1] hover:bg-[#5DA2D5] transition-colors shadow-sm">
            Recent Activity Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-700 w-48">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Activity</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={row.name} />
                      <div>
                        <p className="font-semibold text-gray-800 leading-tight">{row.name}</p>
                        <p className="text-xs text-gray-400">Email : {row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.activity}</td>
                  <td className="px-4 py-3 text-gray-500">{row.time}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
