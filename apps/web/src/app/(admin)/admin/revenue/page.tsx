'use client';

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
  Cell,
} from 'recharts';

// Mock data for charts
const flowData = [
  { name: 'dd-mm-yyyy', value: 0 },
  { name: 'dd-mm-yyyy', value: 12000 },
  { name: 'dd-mm-yyyy', value: 15000 },
  { name: 'dd-mm-yyyy', value: 13000 },
  { name: 'dd-mm-yyyy', value: 18000 },
  { name: 'dd-mm-yyyy', value: 25000 },
  { name: 'dd-mm-yyyy', value: 35000 },
];

const categoriesData = [
  { name: 'Xử lý quyên góp', total: 250, net: 210 },
  { name: 'Dự án đối ứng', total: 150, net: 130 },
  { name: 'Sự kiện nền tảng', total: 100, net: 80 },
  { name: 'Phí xử lý thanh toán', total: 50, net: 40 },
];

const barData = [
  { name: 'Q0y của...', value: 22000 },
  { name: 'Q0y của...', value: 15000 },
  { name: 'Q0y của...', value: 9000 },
  { name: 'Q0y của...', value: 7000 },
  { name: 'Q0y của...', value: 4000 },
];

const grossNetData = [
  { name: 'Gross', gross: 400, net: 350 },
  { name: 'Net', gross: 300, net: 380 },
  { name: 'Gross', gross: 250, net: 200 },
  { name: 'Event', gross: 150, net: 100 },
];

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Top Section: Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#7598C1] rounded-3xl px-6 py-4.5 flex items-center space-x-6 shadow-xl">
          <div className="bg-white/15 p-3 rounded-2xl">
            <PresentationChartLineIcon className="h-9 w-9 text-black" />
          </div>
          <div className="text-black">
            <p className="text-lg font-bold tracking-wide uppercase opacity-100">Tổng số lượng chiến dịch</p>
            <h2 className="text-4xl font-black mt-1 tabular-nums">87</h2>
          </div>
        </div>

        <div className="bg-[#7598C1] rounded-3xl px-6 py-4.5 flex items-center space-x-6 shadow-xl">
          <div className="bg-white/15 p-3 rounded-2xl">
            <CurrencyDollarIcon className="h-9 w-9 text-black" />
          </div>
          <div className="text-black">
            <p className="text-lg font-bold tracking-wide uppercase opacity-100">Tổng doanh thu quỹ</p>
            <h2 className="text-4xl font-black mt-1 tabular-nums">$6,750</h2>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Phí xử lý đã thu:', value: '$3,600', icon: BanknotesIcon },
          { label: 'Phí đối ứng (Thực):', value: '$1,500', icon: ArrowTrendingUpIcon },
          { label: 'Phí sự kiện nền tảng:', value: '$450', icon: TicketIcon },
          { label: 'Tỷ lệ % phí quyên góp:', value: '2.8 %', icon: PercentBadgeIcon, showCheck: true },
        ].map((stat, i) => (
          <div key={i} className="bg-[#7598C1] rounded-2xl p-5 text-black shadow-lg">
            <p className="text-xs font-bold uppercase opacity-80 leading-tight mb-2 h-8">{stat.label}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tabular-nums">{stat.value}</span>
              {stat.showCheck && (
                <div className="bg-white rounded-md p-0.5 ml-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Area Chart & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 tracking-wider">Dòng Doanh thu & Phí (Hàng ngày)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7598C1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7598C1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-30} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#7598C1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#d1d5db] rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-3xl font-black text-gray-800 leading-tight mb-6">Bộ lọc Phân tích</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-700 uppercase mb-1">Khoảng thời gian</label>
                <div className="relative">
                  <select className="w-full bg-white/50 border-none rounded-2xl py-3 px-4 text-gray-600 font-medium italic appearance-none outline-none focus:ring-2 focus:ring-[#7598C1]">
                    <option>Tháng này, Tháng trước,...</option>
                  </select>
                  <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 uppercase mb-1">Hạng mục Phí</label>
                <div className="relative">
                  <select className="w-full bg-white/50 border-none rounded-2xl py-3 px-4 text-gray-600 font-medium italic appearance-none outline-none focus:ring-2 focus:ring-[#7598C1]">
                    <option>Phí xử lý, Phí đối ứng,...</option>
                  </select>
                  <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
          <button className="w-full bg-[#7598C1] text-white py-3.5 mt-6 rounded-2xl font-bold shadow-lg hover:bg-[#5DA2D5] transition-all transform active:scale-[0.98]">
            Cập nhật Phân tích
          </button>
        </div>
      </div>

      {/* Row 2: Horizontal Bar & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 tracking-wider">Phân tích Số dư Theo Danh mục Phí (Tổng vs Thực nhận)</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoriesData} layout="vertical" margin={{ left: 60, right: 60, top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }} width={140} />
                <Tooltip />
                <Legend iconType="square" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar dataKey="total" name="Tổng phí" fill="#7598C1" barSize={14} radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#6b7280', fontWeight: 'bold', formatter: (v: any) => `$${v.toLocaleString()}` }} />
                <Bar dataKey="net" name="Khấu trừ" fill="#10B981" barSize={14} radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: '#10b981', fontWeight: 'bold', formatter: (v: any) => `${(v / 2.5).toFixed(0)}%` }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-2xl font-black text-gray-800 leading-tight mb-1">Chỉ số Hiệu suất Chính về Doanh Thu:</h3>
          <p className="text-xl font-bold text-gray-400 mb-6">30 ngày gần nhất</p>
          <h4 className="text-2xl font-black text-gray-800 mb-4">Các Thông Số:</h4>
          <div className="space-y-3">
            {[
              { label: 'Tổng phí Xử lý Thanh toán', value: '$3,600' },
              { label: 'Phí trung bình trên mỗi Giao dịch Quyên góp', value: '2.8%' },
              { label: 'Doanh thu trung bình theo Dự án', value: '$1,500' },
              { label: 'Ngưỡng phí sự kiện tối thiểu', value: '$10' },
              { label: 'Tổng thu nhập từ phí Tương tác Nền tảng', value: '$450' },
            ].map((m, i) => (
              <div key={i} className="flex items-center text-sm font-bold text-gray-500">
                <span className="flex-1">{m.label}</span>
                <span className="mx-2">:</span>
                <span className="w-20 text-gray-700 text-right">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Vertical Bar & Small Horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 tracking-wider">Biểu Đồ Xu Hướng Lợi Nhuận</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} hide />
                <Tooltip />
                <Bar dataKey="value" fill="#7598C1" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#4b5563', fontSize: 12, fontWeight: 'bold', formatter: (v: any) => `$${v.toLocaleString()}` }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#f3f4f6] rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grossNetData} layout="vertical" margin={{ left: 0, right: 30 }}>
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 'bold' }} width={50} />
                <Bar dataKey="gross" fill="#7598C1" barSize={12} radius={[0, 4, 4, 0]} />
                <Bar dataKey="net" fill="#10B981" barSize={12} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#7598C1] rounded-sm" />
              <span className="text-xs font-bold text-gray-500">Gross</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#10B981] rounded-sm" />
              <span className="text-xs font-bold text-gray-500">Net</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
