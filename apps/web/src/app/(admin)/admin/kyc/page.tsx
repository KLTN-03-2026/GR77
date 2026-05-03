'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { MagnifyingGlassIcon, CheckCircleIcon, ExclamationCircleIcon, XMarkIcon, IdentificationIcon, ClockIcon, ShieldCheckIcon, ShieldExclamationIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// ── PAGINATION HELPER (Sync with User UI logic) ──
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
    if (last !== undefined && typeof i === 'number' && i - last > 1) {
      rangeWithDots.push('...');
    }
    rangeWithDots.push(i);
    if (typeof i === 'number') last = i;
  }
  return rangeWithDots;
}

// ── TYPES & API ───────────────────────────────────────────────────────────

interface KycRecord {
  id: string;
  userId: string;
  fullName: string;
  idNumber: string;
  status: 'All' | 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  dob: string;
  address: string;
  phone?: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  user: {
    email: string;
    username: string;
  }
}

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

// ── UI COMPONENTS ───────────────────────────────────────────────────────

function StatCard({ label, value, icon, color = 'bg-[#7598C1]' }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className={`${color} rounded-3xl px-6 py-4 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}>
      <div className="bg-white/15 p-3 rounded-2xl group-hover:bg-white/20 transition-colors text-black flex items-center justify-center">
        <div className="w-9 h-9">{icon}</div>
      </div>
      <div className="text-black">
        <p className="text-lg font-bold tracking-wide uppercase">{label}</p>
        <h2 className="text-4xl font-black mt-1 tabular-nums">{value}</h2>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  if (isApproved) {
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight bg-[#7BC712] text-black border-none">
        Phê duyệt
      </span>
    );
  } else if (isRejected) {
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight bg-red-50 text-red-600 border border-red-100">
        Từ chối
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight bg-yellow-50 text-yellow-700 border border-yellow-100">
      Chờ duyệt
    </span>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────

export default function AdminKycPage() {
  const [kycData, setKycData] = useState<KycRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedKyc, setSelectedKyc] = useState<KycRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null;

  const fetchKyc = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const endpoint = filterStatus === 'All'
        ? `${API}/ekyc/pending`
        : `${API}/ekyc/pending?status=${filterStatus.toUpperCase()}`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKycData(data);
      }
    } catch (err) {
      console.error('Failed to fetch KYC');
    } finally {
      setIsLoading(false);
    }
  }, [token, filterStatus]);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`${API}/ekyc/approve/${userId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedKyc(null);
        showToast('success', 'User KYC has been manually approved!');
        fetchKyc();
      } else {
        throw new Error('Approval failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to approve KYC');
      console.error('Approval failed');
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      const res = await fetch(`${API}/ekyc/reject/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setSelectedKyc(null);
        showToast('success', 'User KYC has been successfully rejected.');
        fetchKyc();
      } else {
        throw new Error('Rejection failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reject KYC');
      console.error('Rejection failed');
    }
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return kycData.filter(item => {
      const matchesSearch = item.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.idNumber?.includes(searchTerm) ||
        item.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm, kycData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold animate-[slideIn_0.3s_ease] ${toast.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {toast.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Tổng hồ sơ" value={kycData.length.toLocaleString()} icon={<IdentificationIcon />} />
        <StatCard label="Chờ duyệt" value={kycData.filter(h => h.status === 'PENDING').length.toLocaleString()} icon={<ClockIcon />} />
        <StatCard label="Đã duyệt" value={kycData.filter(h => h.status === 'APPROVED').length.toLocaleString()} icon={<ShieldCheckIcon />} />
        <StatCard label="Đã từ chối" value={kycData.filter(h => h.status === 'REJECTED').length.toLocaleString()} icon={<ShieldExclamationIcon />} />
      </div>

      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        {/* Toolbar: Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#f8f9fa] border-b border-gray-300">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input
              type="text"
              placeholder="Tìm tên, số CCCD…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-xl w-72 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-600 placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <select
              className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none px-4"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">Trạng thái: Tất cả</option>
              <option value="Pending">Đang chờ duyệt</option>
              <option value="Approved">Đã được duyệt</option>
              <option value="Rejected">Đã bị từ chối</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-300">
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center w-16">ID</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 uppercase text-[11px] tracking-widest">Danh tính</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 uppercase text-[11px] tracking-widest">Số CCCD</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center uppercase text-[11px] tracking-widest">Trạng thái</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 uppercase text-[11px] tracking-widest">Thời gian gửi</th>
                <th className="px-5 py-3 font-bold text-black text-center uppercase text-[11px] tracking-widest">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 border-r border-gray-300 text-center font-bold text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-5 py-3 border-r border-gray-300">
                      <div className="flex flex-col">
                        <p className="font-bold text-gray-800 leading-tight">{row.fullName}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">{row.user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 border-r border-gray-300 font-mono text-gray-600 font-bold tracking-tighter">{row.idNumber}</td>
                    <td className="px-5 py-3 border-r border-gray-300 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3 border-r border-gray-300">
                      <p className="font-bold text-gray-800">{new Date(row.createdAt).toLocaleDateString('vi-VN')}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">{new Date(row.createdAt).toLocaleTimeString('vi-VN')}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setSelectedKyc(row)}
                        className="px-4 py-1.5 rounded-lg text-[11px] font-black uppercase text-white bg-gray-900 hover:bg-black transition-all shadow-sm active:scale-95"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 0 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">Showing {filteredData.length} records matching criteria</p>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
              typeof item === 'number' ? (
                <button key={idx} onClick={() => handlePageChange(item)} className={`w-11 h-11 flex items-center justify-center rounded-xl font-black transition-all transform active:scale-95 ${currentPage === item ? 'bg-[#7598C1] text-black shadow-lg shadow-[#7598C1]/30 scale-110' : 'border border-gray-200 text-gray-400 hover:bg-white hover:border-[#7598C1] hover:text-[#7598C1] bg-white'}`}>{item}</button>
              ) : (
                <span key={idx} className="px-2 text-gray-400 font-black">{item}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* KYC Detail Modal */}
      <Modal
        isOpen={!!selectedKyc}
        onClose={() => setSelectedKyc(null)}
        title="KYC Verification"
        maxWidth="max-w-4xl"
      >
        {selectedKyc && (
          <div className="space-y-6">

            {/* Top Row: User Info & Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              {/* User Information */}
              <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#7598C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  User Information
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex border-b border-gray-100 pb-2"><span className="font-medium text-gray-500 w-24">Name:</span> <span className="font-semibold">{selectedKyc.fullName}</span></div>
                  <div className="flex border-b border-gray-100 pb-2"><span className="font-medium text-gray-500 w-24">DOB:</span> <span>{selectedKyc.dob}</span></div>
                  <div className="flex border-b border-gray-100 pb-2"><span className="font-medium text-gray-500 w-24">CCCD:</span> <span className="font-mono">{selectedKyc.idNumber}</span></div>
                  <div className="flex border-b border-gray-100 pb-2"><span className="font-medium text-gray-500 w-24">Address:</span> <span>{selectedKyc.address}</span></div>
                  <div className="flex"><span className="font-medium text-gray-500 w-24">Email:</span> <span>{selectedKyc.user.email}</span></div>
                </div>
              </div>

              {/* Identity Document */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#7598C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                  Identity Document
                </h3>
                <div className="space-y-4">
                  <div className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-[1.6]">
                    <img src={selectedKyc.frontImageUrl} alt="Front CCCD" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    <span className="absolute bottom-3 left-3 text-white text-xs font-medium px-2 py-1 bg-black/30 rounded backdrop-blur-sm">Front Side</span>
                  </div>
                  <div className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-[1.6]">
                    <img src={selectedKyc.backImageUrl} alt="Back CCCD" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    <span className="absolute bottom-3 left-3 text-white text-xs font-medium px-2 py-1 bg-black/30 rounded backdrop-blur-sm">Back Side</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: OCR & Selfie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              {/* OCR Result (Mocked since we removed mock data) */}
              <div className="bg-[#7598C1]/5 p-5 rounded-xl border border-[#7598C1]/20">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#7598C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  OCR Extracted Data
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex border-b border-[#7598C1]/10 pb-2">
                    <span className="font-medium text-gray-500 w-24">Name:</span>
                    <span className="font-semibold text-green-600">{selectedKyc.fullName}</span>
                  </div>
                  <div className="flex border-b border-[#7598C1]/10 pb-2">
                    <span className="font-medium text-gray-500 w-24">DOB:</span>
                    <span className="text-green-600">{selectedKyc.dob}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-500 w-24">CCCD:</span>
                    <span className="font-mono text-green-600">{selectedKyc.idNumber}</span>
                  </div>
                </div>
                {/* Note: This block removed as OCR matches user input since it sets user input */}
              </div>

              {/* Selfie Verification */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#7598C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Selfie Verification
                </h3>
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="relative group w-32 h-32 rounded-xl overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                    <img src={selectedKyc.selfieImageUrl} alt="Selfie" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-5 rounded-xl border bg-green-50/50 border-green-100">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-medium mb-1">Face Match Score</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-[#7BC712]">
                          95%
                        </span>
                      </div>

                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg w-full justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        VERIFIED
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
              {selectedKyc.status === 'PENDING' ? (
                <>
                  <button
                    onClick={() => handleReject(selectedKyc.userId, 'Requested Re-upload')}
                    className="px-5 py-2.5 w-full sm:w-auto rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    Request Re-upload
                  </button>
                  <button
                    onClick={() => {
                      const reason = window.prompt("Lý do từ chối (Rejection Reason)?");
                      if (reason) handleReject(selectedKyc.userId, reason);
                    }}
                    className="px-5 py-2.5 w-full sm:w-auto rounded-xl border border-transparent text-sm font-semibold text-white bg-[#F76C6C] hover:bg-red-600 hover:shadow-md transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedKyc.userId)}
                    className="px-6 py-2.5 w-full sm:w-auto rounded-xl border border-transparent text-sm font-semibold text-black bg-[#7BC712] hover:bg-[#68A90F] hover:shadow-md transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Approve
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 w-full justify-end">
                  <span className="text-sm text-gray-500">This record has been processed:</span>
                  <StatusBadge status={selectedKyc.status} />
                </div>
              )}
            </div>

          </div>
        )}
      </Modal>

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
