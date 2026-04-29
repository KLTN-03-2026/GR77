'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants/endpoints';

type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface WithdrawalRequest {
  id: string;
  amount: number;
  reason: string;
  method: 'WALLET' | 'BANK';
  status: WithdrawalStatus;
  txHash: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountOwner: string | null;
  walletAddress: string | null;
  createdAt: string;
  campaign: {
    id: string;
    title: string;
    currentRaisedAmount: number;
    creatorUser: {
      id: string;
      email: string;
      username: string;
      profile: { firstName: string; lastName: string; avatarUrl: string } | null;
    };
  };
}

const STATUS_CONFIG: Record<WithdrawalStatus, { label: string; color: string; dot: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-400' },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-500' },
  REJECTED: { label: 'Từ chối', color: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-400' },
};

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);

  // Form state
  const [txHash, setTxHash] = useState('');
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
      const url = filterStatus
        ? `${API_BASE_URL}/withdrawals/admin/all?status=${filterStatus}`
        : `${API_BASE_URL}/withdrawals/admin/all`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [filterStatus]);

  const openModal = (req: WithdrawalRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setModalType(type);
    setTxHash('');
    setRejectReason('');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalType(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/withdrawals/admin/${selectedRequest.id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ txHash: txHash.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi phê duyệt');
      }
      showToast('✅ Đã phê duyệt yêu cầu rút tiền');
      closeModal();
      fetchAll();
    } catch (e: any) {
      showToast(e.message || 'Lỗi xử lý', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/withdrawals/admin/${selectedRequest.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Lỗi từ chối');
      }
      showToast('Đã từ chối yêu cầu rút tiền');
      closeModal();
      fetchAll();
    } catch (e: any) {
      showToast(e.message || 'Lỗi xử lý', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold transition-all animate-in slide-in-from-top-2 duration-300 ${toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Yêu cầu Rút tiền</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Xem xét và xử lý các yêu cầu rút tiền từ chiến dịch
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-black text-amber-700">{pendingCount} đang chờ duyệt</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        {[
          { value: '', label: 'Tất cả' },
          { value: 'PENDING', label: 'Chờ duyệt' },
          { value: 'APPROVED', label: 'Đã duyệt' },
          { value: 'REJECTED', label: 'Từ chối' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === tab.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-400">Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Chiến dịch / Chủ', 'Số tiền', 'Phương thức', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map(req => {
                  const cfg = STATUS_CONFIG[req.status];
                  const creatorName = req.campaign.creatorUser.profile
                    ? `${req.campaign.creatorUser.profile.firstName || ''} ${req.campaign.creatorUser.profile.lastName || ''}`.trim()
                    : req.campaign.creatorUser.username;

                  return (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-gray-900 line-clamp-1 max-w-[200px]">
                          {req.campaign.title}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{creatorName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-base font-black text-gray-900">
                          {formatVND(Number(req.amount))}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold ml-1">VNĐ</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${req.method === 'WALLET'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                          }`}>
                          {req.method === 'WALLET' ? '🔗 Blockchain' : '🏦 Ngân hàng'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <button
                              id={`approve-${req.id}`}
                              onClick={() => openModal(req, 'approve')}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black rounded-xl transition-all active:scale-95 shadow-sm shadow-green-100"
                            >
                              Duyệt
                            </button>
                            <button
                              id={`reject-${req.id}`}
                              onClick={() => openModal(req, 'reject')}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black rounded-xl transition-all active:scale-95 border border-red-100"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setModalType(null);
                            }}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                          >
                            Xem chi tiết
                          </button>
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

      {/* Detail / Approve / Reject Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className={`p-8 text-white ${modalType === 'approve'
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : modalType === 'reject'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-gray-700 to-gray-900'
              }`}>
              <h2 className="text-lg font-black uppercase tracking-wide">
                {modalType === 'approve' ? '✅ Phê duyệt Rút tiền' : modalType === 'reject' ? '❌ Từ chối Rút tiền' : '📋 Chi tiết yêu cầu'}
              </h2>
              <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-widest">
                {selectedRequest.campaign.title}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-5">
              {/* Amount */}
              <div className="bg-gray-50 rounded-2xl p-5 flex justify-between items-center">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Số tiền</span>
                <span className="text-2xl font-black text-gray-900">
                  {formatVND(Number(selectedRequest.amount))} <span className="text-sm text-gray-400">VNĐ</span>
                </span>
              </div>

              {/* Method Details */}
              {selectedRequest.method === 'WALLET' ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ ví nhận</p>
                  <p className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-4 py-3 rounded-xl break-all">
                    {selectedRequest.walletAddress || 'Không có địa chỉ ví'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ngân hàng</p>
                    <p className="text-sm font-bold text-gray-800">{selectedRequest.bankName || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số tài khoản</p>
                    <p className="text-sm font-bold text-gray-800 font-mono">{selectedRequest.accountNumber || '---'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Chủ tài khoản</p>
                    <p className="text-sm font-bold text-gray-800">{selectedRequest.accountOwner || '---'}</p>
                  </div>
                </div>
              )}

              {/* Reason */}
              {selectedRequest.reason && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lý do rút tiền</p>
                  <p className="text-sm font-medium text-gray-700 bg-gray-50 rounded-xl px-4 py-3">{selectedRequest.reason}</p>
                </div>
              )}

              {/* TxHash (for approved) */}
              {selectedRequest.txHash && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã giao dịch (TxHash)</p>
                  <p className="text-xs font-mono text-green-700 bg-green-50 px-4 py-3 rounded-xl break-all">{selectedRequest.txHash}</p>
                </div>
              )}

              {/* Approve form */}
              {modalType === 'approve' && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Mã giao dịch TxHash (Nếu rút qua Blockchain)
                  </label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={e => setTxHash(e.target.value)}
                    placeholder="0x... (tuỳ chọn)"
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none transition-all"
                  />
                </div>
              )}

              {/* Reject form */}
              {modalType === 'reject' && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Lý do từ chối <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối (bắt buộc)..."
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-black rounded-2xl transition-all uppercase tracking-widest"
              >
                Đóng
              </button>
              {modalType === 'approve' && (
                <button
                  id="confirm-approve-btn"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-black rounded-2xl transition-all uppercase tracking-widest shadow-lg shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✅ Xác nhận duyệt'}
                </button>
              )}
              {modalType === 'reject' && (
                <button
                  id="confirm-reject-btn"
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-black rounded-2xl transition-all uppercase tracking-widest shadow-lg shadow-red-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '❌ Xác nhận từ chối'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
