'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { BanknotesIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '@/lib/constants/endpoints';

// ── Types ──────────────────────────────────────────────────────────
type TxType = 'IN' | 'OUT';

interface UnifiedTransaction {
  id: string;
  type: TxType;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  title: string; // Campaign title or reason
  actor: string; // Donor name or Creator name
  email?: string;
  message?: string;
  txHash?: string | null;
}

// ── Utils ──────────────────────────────────────────────────────────
function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount);
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

// ── Sub-components ──────────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'bg-[#7598C1]' }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className={`flex items-center gap-6 ${color} rounded-2xl px-6 py-4.5 min-w-0 shadow-xl border border-transparent w-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}>
      <div className="text-gray-900 bg-white/15 p-2.5 rounded-2xl flex-shrink-0 flex items-center justify-center">
        <div className="w-10 h-10">{icon}</div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-md sm:text-base font-bold text-gray-800 uppercase tracking-wide opacity-100 truncate" title={label}>{label}</p>
        <p className="text-2xl lg:text-2xl font-black text-gray-900 leading-tight truncate mt-1 tabular-nums" title={value}>{value}</p>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function AdminTransactionsPage() {
  const [inflow, setInflow] = useState<any[]>([]);
  const [outflow, setOutflow] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('adminAccessToken') || localStorage.getItem('accessToken')
      : null;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [inRes, outRes] = await Promise.all([
        fetch(`${API_BASE_URL}/donations/admin/all`, { headers }),
        fetch(`${API_BASE_URL}/withdrawals/admin/all`, { headers })
      ]);

      if (inRes.ok) setInflow(await inRes.json());
      if (outRes.ok) setOutflow(await outRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Transform & Merge ────────────────────────────────────────────
  const unifiedData: UnifiedTransaction[] = useMemo(() => {
    const listIn: UnifiedTransaction[] = inflow.map(tx => ({
      id: tx.id,
      type: 'IN',
      amount: Number(tx.amount),
      status: tx.status,
      method: tx.paymentMethod,
      createdAt: tx.donatedAt || tx.createdAt,
      title: tx.campaign?.title || 'Unknown',
      actor: tx.isAnonymous ? 'Ẩn danh' : (tx.user?.profile ? `${tx.user.profile.firstName} ${tx.user.profile.lastName}`.trim() : tx.user?.username || 'Guest'),
      email: tx.user?.email,
      message: tx.message,
      txHash: tx.txHash
    }));

    const listOut: UnifiedTransaction[] = outflow.map(tx => ({
      id: tx.id,
      type: 'OUT',
      amount: Number(tx.amount),
      status: tx.status,
      method: tx.method,
      createdAt: tx.createdAt,
      title: tx.campaign?.title || 'Unknown',
      actor: tx.campaign?.creatorUser?.username || 'Creator',
      email: tx.campaign?.creatorUser?.email,
      txHash: tx.txHash
    }));

    return [...listIn, ...listOut].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inflow, outflow]);

  // ── Filter / Pagination ─────────────────────────────────────────
  const filteredData = useMemo(() => {
    return unifiedData.filter(tx => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || tx.title.toLowerCase().includes(q) || tx.actor.toLowerCase().includes(q);
      const matchesType = typeFilter === 'All' || tx.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [unifiedData, searchQuery, typeFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalIn = inflow.reduce((sum, tx) => sum + (tx.status === 'SUCCESS' ? Number(tx.amount) : 0), 0);
  const totalOut = outflow.reduce((sum, tx) => sum + (tx.status === 'DISBURSED' ? Number(tx.amount) : 0), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Tổng thu (Nạp)" value={totalIn.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} icon={<ArrowUpRightIcon />} />
        <StatCard label="Tổng chi (Rút)" value={totalOut.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} icon={<ArrowDownRightIcon />} />
        <StatCard label="Số dư hiện tại" value={(totalIn - totalOut).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} icon={<BanknotesIcon />} />
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#f8f9fa] border-b border-gray-300">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2ba6e1]" strokeWidth={2.5} />
              <input
                type="text"
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-72 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-600 placeholder:text-gray-400"
                placeholder="Tìm chiến dịch, người thực hiện…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="relative">
              <select
                className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none px-4"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">Loại: Tất cả</option>
                <option value="IN">Dòng tiền NẠP (IN)</option>
                <option value="OUT">Dòng tiền RÚT (OUT)</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button onClick={fetchAll} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-300">
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center w-16">STT</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center">Thành phần</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center">Loại</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center">Giá trị</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center">Trạng thái</th>
                <th className="px-5 py-3 font-bold text-black text-center">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-20 text-center text-gray-400 italic">Đang tải lịch sử giao dịch…</td></tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((tx, idx) => (
                  <tr key={tx.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 border-r border-gray-300 text-center font-bold text-gray-500">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-5 py-3 border-r border-gray-300">
                      <div className="flex flex-col">
                        <p className="font-bold text-gray-900 leading-tight line-clamp-1 italic">"{tx.title}"</p>
                        <p className="text-[12px] text-gray-500 mt-1 font-medium">{tx.actor} • {tx.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 border-r border-gray-300 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-black uppercase tracking-tight ${tx.type === 'IN' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                        {tx.type === 'IN' ? 'Dòng tiền Nạp' : 'Dòng tiền Rút'}
                      </span>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase leading-none">{tx.method}</p>
                      {tx.txHash && (
                        <div className="mt-1.5 flex items-center justify-center gap-1">
                          <code className="text-[9px] font-mono text-[#2ba6e1] bg-blue-50 px-1 py-0.5 rounded border border-blue-100" title={tx.txHash}>
                            {tx.txHash.substring(0, 6)}...{tx.txHash.substring(tx.txHash.length - 4)}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://amoy.polygonscan.com/tx/${tx.txHash}`, '_blank');
                            }}
                            className="hover:text-blue-600 text-gray-400 transition-colors"
                            title="View on PolygonScan"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 border-r border-gray-300 text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        {/* Số tiền */}
                        <span className={`text-base font-black ${tx.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'IN' ? '+' : '-'}{formatVND(tx.amount)}
                        </span>

                        {/* Đơn vị VNĐ */}
                        <span className="text-[13px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                          VNĐ
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 border-r border-gray-300 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight ${tx.status === 'SUCCESS' || tx.status === 'DISBURSED' ? 'bg-[#7BC712] text-black border-none' : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-gray-800">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">{new Date(tx.createdAt).toLocaleTimeString('vi-VN')}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-5 py-20 text-center text-gray-400 italic">Không tìm thấy giao dịch nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
              typeof item === 'number' ? (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(item)}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl font-black transition-all transform active:scale-95 ${currentPage === item
                    ? 'bg-[#7598C1] text-black shadow-lg scale-110'
                    : 'border border-gray-200 text-gray-400 hover:bg-white hover:border-[#7598C1] hover:text-[#7598C1] bg-white'
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
  );
}
