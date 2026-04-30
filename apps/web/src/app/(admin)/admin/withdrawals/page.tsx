'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '@/lib/constants/endpoints';

// ── Types ──────────────────────────────────────────────────────────
type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED';

interface WithdrawalRequest {
  id: string;
  amount: number;
  reason: string;
  method: 'WALLET' | 'BANK';
  status: WithdrawalStatus;
  txHash: string | null;
  onchainTxHash: string | null;
  polAmount: number | null;
  exchangeRate: number | null;
  bankTransferProof: string | null;
  adminNote: string | null;
  approvedAt: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountOwner: string | null;
  walletAddress: string | null;
  createdAt: string;
  campaign: {
    id: string;
    title: string;
    currentRaisedAmount: number;
    currentBalance: number;
    creatorUser: {
      id: string;
      email: string;
      username: string;
      profile: { firstName: string; lastName: string; avatarUrl: string } | null;
    };
  };
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

const DEFAULT_EXCHANGE_RATE = 1000;

// ── Sub-components ──────────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#7598C1] rounded-3xl px-6 py-4 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
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

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const CONFIG: Record<WithdrawalStatus, { label: string; color: string }> = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    APPROVED: { label: 'Đã duyệt', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    REJECTED: { label: 'Từ chối', color: 'bg-red-50 text-red-700 border-red-100' },
    DISBURSED: { label: 'Đã giải ngân', color: 'bg-green-50 text-green-700 border-green-100' },
  };
  const cfg = CONFIG[status];
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'disburse' | 'detail' | null>(null);

  // Form state
  const [onchainTxHash, setOnchainTxHash] = useState('');
  const [polAmount, setPolAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(String(DEFAULT_EXCHANGE_RATE));
  const [bankTransferProof, setBankTransferProof] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const getToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('adminAccessToken') || localStorage.getItem('accessToken')
      : null;

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/withdrawals/admin/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setRequests(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Modal Actions ────────────────────────────────────────────────
  const openModal = (req: WithdrawalRequest, type: typeof modalType) => {
    setSelectedRequest(req);
    setModalType(type);
    const computedPol = req.amount ? (Number(req.amount) / DEFAULT_EXCHANGE_RATE).toFixed(6) : '';
    setPolAmount(req.polAmount ? String(req.polAmount) : computedPol);
    setExchangeRate(req.exchangeRate ? String(req.exchangeRate) : String(DEFAULT_EXCHANGE_RATE));
    setOnchainTxHash(req.onchainTxHash || '');
    setBankTransferProof(req.bankTransferProof || '');
    setAdminNote(req.adminNote || '');
    setRejectReason('');
  };

  const closeModal = () => { setSelectedRequest(null); setModalType(null); };

  const handleAction = async (action: 'approve' | 'disburse' | 'reject') => {
    if (!selectedRequest) return;
    if (action === 'reject' && !rejectReason.trim()) return;

    setIsSubmitting(true);
    try {
      const body = action === 'reject'
        ? { reason: rejectReason }
        : {
          onchainTxHash: onchainTxHash.trim() || undefined,
          polAmount: polAmount ? Number(polAmount) : undefined,
          exchangeRate: exchangeRate ? Number(exchangeRate) : undefined,
          bankTransferProof: bankTransferProof.trim() || undefined,
          adminNote: adminNote.trim() || undefined,
        };

      const res = await fetch(`${API_BASE_URL}/withdrawals/admin/${selectedRequest.id}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Lỗi xử lý');

      showToast(`✅ Thành công: ${action.toUpperCase()}`);
      closeModal();
      fetchAll();
    } catch (e: any) {
      showToast(e.message || 'Lỗi hệ thống', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filter / Pagination ─────────────────────────────────────────
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        req.campaign.title.toLowerCase().includes(q) ||
        req.campaign.creatorUser.username.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const computedPolValue = selectedRequest && exchangeRate
    ? (Number(selectedRequest.amount) / Number(exchangeRate)).toFixed(6)
    : '0';

  return (
    <div className="space-y-8 pb-20">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold transition-all animate-in slide-in-from-top-2 duration-300 ${toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Tổng yêu cầu" value={requests.length.toLocaleString()} icon={<BanknotesIcon />} />
        <StatCard label="Chờ duyệt" value={requests.filter(r => r.status === 'PENDING').length.toLocaleString()} icon={<ClockIcon />} />
        <StatCard label="Đã hoàn tất" value={requests.filter(r => r.status === 'DISBURSED').length.toLocaleString()} icon={<CheckCircleIcon />} />
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
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-64 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-600 placeholder:text-gray-400"
                placeholder="Tìm chiến dịch, creator…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="relative">
              <select
                className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">Trạng thái: Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt (Chờ tiền)</option>
                <option value="DISBURSED">Đã giải ngân</option>
                <option value="REJECTED">Bị từ chối</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={fetchAll}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
            title="Làm mới"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-300">
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center w-16">ID</th>
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300">Chiến dịch / Creator</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Số tiền (VNĐ)</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Trạng thái</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Ngày tạo</th>
                <th className="px-4 py-3 font-bold text-black text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center text-gray-400 italic">Đang tải dữ liệu…</td>
                </tr>
              ) : paginatedRequests.length > 0 ? (
                paginatedRequests.map((req, index) => (
                  <tr key={req.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 border-r border-gray-300 text-center font-bold text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-5 py-3 border-r border-gray-300">
                      <div>
                        <p className="font-bold text-gray-800 leading-tight line-clamp-1">{req.campaign.title}</p>
                        <p className="text-[11px] text-blue-600 font-bold mt-0.5">Creator: {req.campaign.creatorUser.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <div className="flex items-center gap-1.5 font-black text-gray-900">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                        {formatVND(req.amount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 border-r border-gray-300 font-bold text-gray-500 text-xs">
                      {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button title="Xem chi tiết" onClick={() => openModal(req, 'detail')} className="text-blue-500 hover:text-blue-700 transition-colors">
                          <EyeIcon className="w-5 h-5" />
                        </button>

                        {req.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => openModal(req, 'approve')} className="text-green-600 font-black text-[10px] uppercase hover:underline">
                              Duyệt
                            </button>
                            <button onClick={() => openModal(req, 'reject')} className="text-red-500 font-black text-[10px] uppercase hover:underline">
                              Từ chối
                            </button>
                          </div>
                        )}

                        {req.status === 'APPROVED' && (
                          <button onClick={() => openModal(req, 'disburse')} className="bg-indigo-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase shadow-sm animate-pulse">
                            Giải ngân
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center text-gray-400 italic">Không tìm thấy yêu cầu nào</td>
                </tr>
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

      {/* ── MODALS ── */}
      {selectedRequest && modalType && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className={`p-8 text-white flex items-center justify-between ${modalType === 'approve' ? 'bg-green-600' :
              modalType === 'reject' ? 'bg-red-600' :
                modalType === 'disburse' ? 'bg-indigo-600' : 'bg-gray-800'
              }`}>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {modalType === 'approve' ? 'Phê duyệt' : modalType === 'reject' ? 'Từ chối' : modalType === 'disburse' ? 'Giải ngân' : 'Chi tiết'}
                </h2>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Yêu cầu #{selectedRequest.id.slice(0, 8)}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full">
                <ChevronDownIcon className="w-6 h-6 rotate-180" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Số tiền</p>
                  <p className="text-xl font-black text-gray-900">{formatVND(selectedRequest.amount)} VND</p>
                </div>
                <div className="p-4 bg-gray-50 border rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Phương thức</p>
                  <p className="text-sm font-black text-gray-900">{selectedRequest.method === 'BANK' ? 'NGÂN HÀNG' : 'BLOCKCHAIN'}</p>
                </div>
              </div>

              {/* Bank/Wallet Details */}
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Thông tin nhận tiền</p>
                {selectedRequest.method === 'BANK' ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-700">Ngân hàng: <span className="text-gray-900">{selectedRequest.bankName}</span></p>
                    <p className="text-sm font-bold text-gray-700">STK: <span className="text-gray-900 font-mono">{selectedRequest.accountNumber}</span></p>
                    <p className="text-sm font-bold text-gray-700">Chủ TK: <span className="text-gray-900 uppercase">{selectedRequest.accountOwner}</span></p>
                  </div>
                ) : (
                  <p className="text-sm font-mono font-bold text-gray-900 break-all">{selectedRequest.walletAddress}</p>
                )}
              </div>

              {/* Forms for Actions */}
              {modalType === 'reject' ? (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Lý do từ chối *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full h-28 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                    placeholder="Nhập lý do..."
                  />
                </div>
              ) : (modalType === 'approve' || modalType === 'disburse') ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-dashed border-gray-200">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Tỷ giá (VNĐ/POL)</label>
                      <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Số POL tương đương</label>
                      <input type="number" value={polAmount || computedPolValue} onChange={e => setPolAmount(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm font-black text-purple-700" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">TxHash On-chain</label>
                    <input type="text" value={onchainTxHash} onChange={e => setOnchainTxHash(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-xs font-mono" placeholder="0x..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">URL Bill chuyển khoản</label>
                    <input type="text" value={bankTransferProof} onChange={e => setBankTransferProof(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-xs" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Ghi chú nội bộ</label>
                    <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} className="w-full px-4 py-2 border rounded-xl text-xs h-16" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-dashed">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Thông tin phê duyệt</p>
                  <p className="text-sm font-medium text-gray-600 whitespace-pre-wrap">{selectedRequest.adminNote || 'Chưa có ghi chú'}</p>
                  {selectedRequest.bankTransferProof && (
                    <a href={selectedRequest.bankTransferProof} target="_blank" className="block text-blue-600 font-black text-xs uppercase hover:underline">
                      📎 Xem bill chuyển khoản
                    </a>
                  )}
                  {selectedRequest.onchainTxHash && (
                    <a href={`https://amoy.polygonscan.com/tx/${selectedRequest.onchainTxHash}`} target="_blank" className="block text-green-600 font-black text-xs uppercase hover:underline">
                      🔗 Xem giao dịch Blockchain
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50 border-t flex gap-4">
              <button onClick={closeModal} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Hủy</button>
              {modalType !== 'detail' && (
                <button
                  disabled={isSubmitting}
                  onClick={() => handleAction(modalType as any)}
                  className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${modalType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    modalType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {isSubmitting ? 'ĐANG XỬ LÝ...' : `XÁC NHẬN ${modalType.toUpperCase()}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
