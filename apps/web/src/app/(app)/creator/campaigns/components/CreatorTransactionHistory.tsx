'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants/endpoints';
import { HandCoins, Landmark, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface WithdrawalRecord {
    id: string;
    amount: number;
    reason: string | null;
    method: 'WALLET' | 'BANK';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    txHash: string | null;
    bankName: string | null;
    accountNumber: string | null;
    accountOwner: string | null;
    walletAddress: string | null;
    createdAt: string;
}

interface DonationRecord {
    id: string;
    amount: number;
    message: string | null;
    isAnonymous: boolean;
    paymentMethod: string;
    status: string;
    donatedAt: string | null;
    createdAt: string;
    user?: {
        username: string;
        profile?: { firstName: string; lastName: string; avatarUrl: string | null };
    };
    txHash?: string | null;
    paymentTransactions?: Array<{ orderId: string; provider: string }>;
}

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN').format(n);
}
function formatDate(d: string) {
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    APPROVED: { label: 'Đã duyệt', cls: 'bg-green-50 text-green-700 border-green-100' },
    REJECTED: { label: 'Từ chối', cls: 'bg-red-50 text-red-700 border-red-100' },
    SUCCESS: { label: 'Thành công', cls: 'bg-green-50 text-green-700 border-green-100' },
    PENDING_PAYMENT: { label: 'Chờ thanh toán', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
    FAILED: { label: 'Thất bại', cls: 'bg-red-50 text-red-700 border-red-100' },
};

interface Props {
    campaignId: string;
    onBack?: () => void;
}

export function CreatorTransactionHistory({ campaignId, onBack }: Props) {
    const [tab, setTab] = useState<'donations' | 'withdrawals'>('donations');
    const [donations, setDonations] = useState<DonationRecord[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        setIsLoading(true);

        Promise.all([
            fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.ok ? r.json() : null),
            fetch(`${API_BASE_URL}/withdrawals/campaign/${campaignId}`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.ok ? r.json() : []),
        ]).then(([campaignData, wds]) => {
            setDonations(campaignData?.donations || []);
            setWithdrawals(Array.isArray(wds) ? wds : []);
        }).finally(() => setIsLoading(false));
    }, [campaignId]);

    const displayed = donations.slice(0, visibleCount);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-gray-100">
                {onBack && (
                    <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                )}
                <h2 className="text-base font-black text-gray-900 uppercase tracking-widest">Lịch sử Giao dịch</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-gray-100">
                <button
                    onClick={() => setTab('donations')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${tab === 'donations'
                        ? 'bg-cyan-50 border-2 border-cyan-500 text-cyan-700 shadow-sm'
                        : 'bg-gray-100 border-2 border-transparent text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    <HandCoins className="w-4 h-4" />
                    Quyên góp <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${tab === 'donations' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-200 text-gray-500'}`}>{donations.length}</span>
                </button>
                <button
                    onClick={() => setTab('withdrawals')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${tab === 'withdrawals'
                        ? 'bg-green-50 border-2 border-green-500 text-green-700 shadow-sm'
                        : 'bg-gray-100 border-2 border-transparent text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    <Landmark className="w-4 h-4" />
                    Rút tiền <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${tab === 'withdrawals' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{withdrawals.length}</span>
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-gray-100 border-t-cyan-500 rounded-full animate-spin" />
                    </div>
                ) : tab === 'donations' ? (
                    <div className="space-y-3">
                        {donations.length === 0 ? (
                            <p className="text-center py-10 text-sm text-gray-400 italic">Chưa có lượt quyên góp nào.</p>
                        ) : (
                            <>
                                {displayed.map((d) => {
                                    const name = d.isAnonymous ? 'Ẩn danh' :
                                        d.user?.profile
                                            ? `${d.user.profile.firstName || ''} ${d.user.profile.lastName || ''}`.trim() || d.user?.username
                                            : d.user?.username || 'Khách';
                                    const avatar = d.user?.profile?.avatarUrl;
                                    const statusCfg = STATUS_MAP[d.status] || { label: d.status, cls: 'bg-gray-100 text-gray-600' };
                                    return (
                                        <div key={d.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                                                    {avatar ? (
                                                        <img src={avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-black text-blue-400 uppercase">{String(name).charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                        {formatDate(d.donatedAt || d.createdAt)} · {d.paymentMethod}
                                                    </p>
                                                    <div className="mt-1.5 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-500">
                                                        {/* PayOS Reference */}
                                                        {d.paymentMethod === 'PAYOS' && d.paymentTransactions?.[0] && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Đơn PayOS:</span>
                                                                <span className="text-[10px] font-bold text-gray-600">#{d.paymentTransactions[0].orderId}</span>
                                                            </div>
                                                        )}

                                                        {/* On-chain Link */}
                                                        {d.txHash ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Xác thực:</span>
                                                                <code className="text-[10px] font-mono text-[#0891B2] bg-cyan-50/50 px-1.5 py-0.5 rounded border border-cyan-100/50">
                                                                    {d.txHash.substring(0, 8)}...{d.txHash.substring(d.txHash.length - 6)}
                                                                </code>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`https://amoy.polygonscan.com/tx/${d.txHash}`, '_blank');
                                                                    }}
                                                                    className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-[#0891B2] transition-all border border-transparent hover:border-gray-200"
                                                                    title="Xem trên PolygonScan"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                                                </button>
                                                            </div>
                                                        ) : d.paymentMethod === 'PAYOS' && (
                                                            <span className="text-[10px] font-black uppercase tracking-tighter italic text-amber-500">Đang đồng bộ...</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-green-600">+{formatVND(Number(d.amount))} VND</p>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border inline-block mt-0.5 ${statusCfg.cls}`}>{statusCfg.label}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="flex justify-center gap-3 pt-2">
                                    {donations.length > visibleCount && (
                                        <button onClick={() => setVisibleCount(c => c + 5)} className="flex items-center gap-1.5 px-5 py-2 rounded-full border-2 border-cyan-500 text-cyan-600 text-xs font-black hover:bg-cyan-50 transition-all active:scale-95">
                                            Xem thêm <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {visibleCount > 5 && (
                                        <button onClick={() => setVisibleCount(5)} className="flex items-center gap-1.5 px-5 py-2 rounded-full border-2 border-gray-200 text-gray-500 text-xs font-black hover:bg-gray-50 transition-all active:scale-95">
                                            Thu gọn <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {withdrawals.length === 0 ? (
                            <p className="text-center py-10 text-sm text-gray-400 italic">Chưa có yêu cầu rút tiền nào.</p>
                        ) : (
                            withdrawals.map((w) => {
                                const cfg = STATUS_MAP[w.status] || { label: w.status, cls: 'bg-gray-100 text-gray-600' };
                                return (
                                    <div key={w.id} className="p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{w.reason || 'Yêu cầu rút tiền'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                    {formatDate(w.createdAt)} · {w.method === 'WALLET' ? '🔗 Blockchain' : '🏦 Ngân hàng'}
                                                </p>
                                                {w.method === 'BANK' && w.bankName && (
                                                    <p className="text-[11px] text-gray-500 font-medium mt-1">{w.bankName} · {w.accountNumber}</p>
                                                )}
                                                {w.method === 'WALLET' && w.walletAddress && (
                                                    <p className="text-[10px] font-mono text-blue-500 mt-1 break-all">{w.walletAddress.slice(0, 16)}...</p>
                                                )}
                                                {w.txHash && (
                                                    <p className="text-[10px] font-mono text-green-600 mt-1">TxHash: {w.txHash.slice(0, 18)}...</p>
                                                )}
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="text-base font-black text-red-500">-{formatVND(Number(w.amount))} VND</p>
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-block mt-1 ${cfg.cls}`}>{cfg.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
