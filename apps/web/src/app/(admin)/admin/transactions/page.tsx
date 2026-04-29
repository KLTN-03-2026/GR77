'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants/endpoints';
import { HandCoins, ArrowRightLeft, Search, Filter } from 'lucide-react';

interface DonationResult {
  id: string;
  amount: number;
  message: string | null;
  isAnonymous: boolean;
  paymentMethod: string;
  status: string;
  donatedAt: string | null;
  createdAt: string;
  campaign: {
    id: string;
    title: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  SUCCESS: { label: '✔️ Thành công', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
  PENDING: { label: '⏳ Đang chờ', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  FAILED: { label: '❌ Thất bại', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
};

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(d);
}

export default function AdminTransactionsPage() {
  const [donations, setDonations] = useState<DonationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('');

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminAccessToken') || localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterMethod) params.append('method', filterMethod);

      const res = await fetch(`${API_BASE_URL}/donations/admin/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [filterStatus, filterMethod]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-cyan-500" />
            Giao dịch Quyên góp
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Quản lý toàn bộ giao dịch quyên góp trên hệ thống
          </p>
        </div>
        <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
          {/* Metrics/Stats (Placeholder for future iteration if needed) */}
          <div className="px-5 py-2 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tổng số GD</p>
            <p className="text-sm font-bold text-gray-900">{donations.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mr-4">
          <Filter className="w-4 h-4" /> BỘ LỌC
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer flex-1"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="FAILED">Thất bại</option>
          </select>

          <select
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer flex-1"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="">Tất cả phương thức</option>
            <option value="PAYOS">PayOS (Nội địa)</option>
            <option value="WALLET">Wallet (Blockchain)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
              <HandCoins className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-400">Không tìm thấy giao dịch nào phù hợp</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Người Quyên Góp</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Chiến Dịch</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Số Tiền</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">Trạng Thái</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donations.map((tx) => {
                  const cfg = STATUS_CONFIG[tx.status] || { label: tx.status, bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
                  const donorName = tx.isAnonymous ? 'Ẩn danh' :
                    tx.user?.profile
                      ? `${tx.user.profile.firstName || ''} ${tx.user.profile.lastName || ''}`.trim() || tx.user?.username
                      : tx.user?.username || 'Khách vãng lai';

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 line-clamp-1">{donorName}</span>
                          {!tx.isAnonymous && tx.user?.email && (
                            <span className="text-[10px] font-bold text-gray-400 mt-0.5">{tx.user.email}</span>
                          )}
                          {tx.isAnonymous && (
                            <span className="text-[10px] font-bold text-gray-400 mt-0.5">(Quyên góp ẩn danh)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-gray-700 line-clamp-2 max-w-[250px] leading-relaxed group-hover:text-cyan-600 transition-colors">
                          {tx.campaign?.title || 'Unknown Campaign'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-base font-black text-green-600">
                            +{formatVND(Number(tx.amount))} <span className="text-[10px] text-gray-400">VND</span>
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest mt-1 px-1.5 py-0.5 rounded-md border ${tx.paymentMethod === 'WALLET' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                            {tx.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-500">
                          {formatDate(tx.donatedAt || tx.createdAt)}
                        </span>
                        {tx.message && (
                          <p className="text-[10px] text-gray-400 italic mt-1 line-clamp-1 max-w-[150px]" title={tx.message}>
                            "{tx.message}"
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
