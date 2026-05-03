'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/constants/endpoints';
import { HandCoins, Landmark, ChevronLeft, ChevronRight, ArrowLeft, Wallet } from 'lucide-react';

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
    PENDING: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    APPROVED: { label: 'Approved', cls: 'bg-green-50 text-green-700 border-green-100' },
    REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-100' },
    SUCCESS: { label: 'Success', cls: 'bg-green-50 text-green-700 border-green-100' },
    PENDING_PAYMENT: { label: 'Awaiting Payment', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
    FAILED: { label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-100' },
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = tab === 'donations' ? 5 : 4;

    useEffect(() => {
        setCurrentPage(1);
    }, [tab]);

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

    const currentList = tab === 'donations' ? donations : withdrawals;
    const totalPages = Math.ceil(currentList.length / itemsPerPage);
    const displayedDonations = donations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const displayedWithdrawals = withdrawals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white rounded-xl shadow-sm border-1 border-gray-300 overflow-hidden h-[700px] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-gray-100">
                {onBack && (
                    <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </button>
                )}
                <div className="flex flex-col">
                    <h2 className="text-lg font-black text-gray-900 italic mb-1">Transaction History</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Monitor your funding flow
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-gray-100">
                <button
                    onClick={() => setTab('donations')}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${tab === 'donations'
                        ? 'bg-[#0891B2]/5 border-2 border-[#0891B2] text-[#0891B2] shadow-sm'
                        : 'bg-gray-100 border-2 border-transparent text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    <HandCoins className="w-4 h-4" />
                    Donations <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${tab === 'donations' ? 'bg-[#0891B2]/20 text-[#0891B2]' : 'bg-gray-200 text-gray-500'}`}>{donations.length}</span>
                </button>
                <button
                    onClick={() => setTab('withdrawals')}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${tab === 'withdrawals'
                        ? 'bg-green-50 border-2 border-green-500 text-green-700 shadow-sm'
                        : 'bg-gray-100 border-2 border-transparent text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    <Landmark className="w-4 h-4" />
                    Withdrawals <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${tab === 'withdrawals' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{withdrawals.length}</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pb-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#0891B2] rounded-full animate-spin" />
                        </div>
                    ) : tab === 'donations' ? (
                        <div className="flex flex-col">
                            {donations.length === 0 ? (
                                <p className="text-center py-10 text-sm text-gray-400 italic px-4">No donations yet.</p>
                            ) : (
                                displayedDonations.map((d) => {
                                    const name = d.isAnonymous ? 'Anonymous' :
                                        d.user?.profile
                                            ? `${d.user.profile.firstName || ''} ${d.user.profile.lastName || ''}`.trim() || d.user?.username
                                            : d.user?.username || 'Guest';
                                    const avatar = d.user?.profile?.avatarUrl;
                                    const statusCfg = STATUS_MAP[d.status] || { label: d.status, cls: 'bg-gray-100 text-gray-600' };
                                    return (
                                        <div key={d.id} className="flex items-center justify-between py-1.5 px-4 sm:px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-full bg-[#0891B2]/5 border border-[#0891B2]/10 flex items-center justify-center overflow-hidden">
                                                    {avatar ? (
                                                        <img src={avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-black text-[#0891B2]/50 uppercase">{String(name).charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 leading-tight">{name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                        {formatDate(d.donatedAt || d.createdAt)} · {d.paymentMethod}
                                                    </p>

                                                    <div className="mt-1 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-500 min-h-[36px] justify-center">
                                                        {/* Line 1: Reference or Network */}
                                                        {d.paymentMethod === 'PAYOS' && d.paymentTransactions?.[0] ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">PayOS Ref:</span>
                                                                <span className="text-[10px] font-bold text-[#0891B2]">#{d.paymentTransactions[0].orderId}</span>
                                                            </div>
                                                        ) : d.paymentMethod === 'WALLET' ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Network:</span>
                                                                <span className="text-[10px] font-bold text-[#0891B2]">Polygon Amoy</span>
                                                            </div>
                                                        ) : null}

                                                        {/* Line 2: Verified Hash or Status */}
                                                        <div className="flex items-center gap-1">
                                                            {d.txHash ? (
                                                                <>
                                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Verified:</span>
                                                                    <code className="text-[10px] font-mono text-[#0891B2] bg-[#0891B2]/5 px-1 py-0.5 rounded border border-[#0891B2]/20">
                                                                        {d.txHash.substring(0, 8)}...{d.txHash.substring(d.txHash.length - 6)}
                                                                    </code>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(`https://amoy.polygonscan.com/tx/${d.txHash}`, '_blank');
                                                                        }}
                                                                        className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-500 hover:text-[#0891B2] transition-all border border-transparent hover:border-gray-200"
                                                                        title="View on PolygonScan"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                                                    </button>
                                                                </>
                                                            ) : d.paymentMethod === 'PAYOS' ? (
                                                                <span className="text-[10px] font-black uppercase tracking-tighter italic text-amber-500">Syncing...</span>
                                                            ) : (
                                                                <span className="text-[10px] font-black uppercase tracking-tighter italic text-gray-300">Processing...</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-green-600">+{formatVND(Number(d.amount))} VND</p>
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border inline-block mt-0.5 ${statusCfg.cls}`}>{statusCfg.label}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {withdrawals.length === 0 ? (
                                <p className="text-center py-10 text-sm text-gray-400 italic px-4">No withdrawal requests yet.</p>
                            ) : (
                                displayedWithdrawals.map((w) => {
                                    const cfg = STATUS_MAP[w.status] || { label: w.status, cls: 'bg-gray-100 text-gray-600' };
                                    return (
                                        <div key={w.id} className="flex justify-between items-center py-1.5 px-4 sm:px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all">
                                            <div>
                                                <div className="h-[38px] flex flex-col justify-center">
                                                    <p className="text-sm font-black text-gray-900 leading-tight line-clamp-2">{w.reason || 'Withdrawal Request'}</p>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                    {formatDate(w.createdAt)} · {w.method === 'WALLET' ? '🔗 Blockchain' : '🏦 Bank'}
                                                </p>

                                                <div className="mt-1 flex flex-col justify-center gap-0.5 min-h-[36px] animate-in fade-in slide-in-from-top-1 duration-500">
                                                    {w.method === 'BANK' && w.bankName && (
                                                        <p className="text-[11px] text-gray-500 font-medium">{w.bankName} · {w.accountNumber}</p>
                                                    )}
                                                    {w.method === 'WALLET' && w.walletAddress && (
                                                        <p className="text-[10px] font-mono text-[#0891B2] break-all">{w.walletAddress.slice(0, 16)}...</p>
                                                    )}
                                                    {w.txHash ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">TxHash:</span>
                                                            <code className="text-[10px] font-mono text-[#0891B2] bg-[#0891B2]/5 px-1 py-0.5 rounded border border-[#0891B2]/20">
                                                                {w.txHash.substring(0, 8)}...{w.txHash.substring(w.txHash.length - 6)}
                                                            </code>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(`https://amoy.polygonscan.com/tx/${w.txHash}`, '_blank');
                                                                }}
                                                                className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-500 hover:text-[#0891B2] transition-all border border-transparent hover:border-gray-200"
                                                                title="View on PolygonScan"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] font-black uppercase tracking-tighter italic text-orange-400">Processing...</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="text-sm font-black text-red-500">-{formatVND(Number(w.amount))} VND</p>
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-block mt-1 ${cfg.cls}`}>{cfg.label}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold transition-colors ${currentPage === 1
                                ? "text-gray-500"
                                : "text-[#0891B2] hover:text-[#0891B2]/80 cursor-pointer"
                                }`}
                        >
                            <ChevronLeft className="w-3 h-3" />
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === page
                                        ? "bg-[#0891B2] text-white shadow-sm shadow-[#0891B2]/20"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold transition-colors ${currentPage === totalPages
                                ? "text-gray-500"
                                : "text-[#0891B2] hover:text-[#0891B2]/80 cursor-pointer"
                                }`}
                        >
                            Next
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
