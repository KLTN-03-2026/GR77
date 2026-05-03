"use client";

import { useState } from "react";
import { Rss, HandCoins, Landmark, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "../../../home/[id]/_utils/formatters";

const TEAL = '#0891B2';

interface CampaignTabsProps {
    campaign: any;
    currentUser: any;
}

export function CampaignTabs({ campaign, currentUser }: CampaignTabsProps) {
    const [activeTab, setActiveTab] = useState<'donations' | 'withdrawals' | 'news'>('news');

    const donations = campaign?.donations || [];
    const withdrawals = campaign?.withdrawalRequests || [];
    const news = campaign?.news || [];

    return (
        <div className="px-4 sm:px-8 pb-8 max-w-7xl mx-auto mt-8">
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${TEAL}60;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${TEAL};
                }
            `}</style>
            {/* Tab Headers */}
            <div className="flex overflow-x-auto gap-3 p-2 mb-4 border-b border-gray-200 hide-scrollbar items-center">
                <button
                    onClick={() => setActiveTab('news')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black transition-all whitespace-nowrap border ${activeTab === 'news'
                        ? 'bg-[#0891B2] border-[#0891B2] text-white'
                        : 'bg-cyan-50/50 border-2 border-[#0891B2] text-[#0891B2]/70 hover:bg-[#0891B2]/70 hover:text-white'
                        }`}
                >
                    <Rss className="w-4 h-4" /> News
                </button>
                <button
                    onClick={() => setActiveTab('donations')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black transition-all whitespace-nowrap border ${activeTab === 'donations'
                        ? 'bg-[#0891B2] border-[#0891B2] text-white'
                        : 'bg-cyan-50/50 border-2 border-[#0891B2] text-[#0891B2]/70 hover:bg-[#0891B2]/70 hover:text-white'
                        }`}
                >
                    <HandCoins className="w-4 h-4" /> Donations
                </button>
                <button
                    onClick={() => setActiveTab('withdrawals')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black transition-all whitespace-nowrap border ${activeTab === 'withdrawals'
                        ? 'bg-[#0891B2] border-[#0891B2] text-white'
                        : 'bg-cyan-50/50 border-2 border-[#0891B2] text-[#0891B2]/70 hover:bg-[#0891B2]/70 hover:text-white'
                        }`}
                >
                    <Landmark className="w-4 h-4" /> Withdrawals
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'donations' && (
                    <div className="bg-white rounded-xl border-1 border-gray-300 shadow-sm h-[600px] flex flex-col overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-lg font-black text-gray-900 italic">Donation History</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pb-2">
                            {donations.length > 0 ? (
                                <div className="flex flex-col">
                                    {donations.map((donation: any) => {
                                        const profile = donation.user?.profile;
                                        const isMe = donation.userId === currentUser?.id;
                                        const accountName = donation.user?.username || "Guest";
                                        const fullNameArr = profile ? [profile.lastName, profile.firstName].filter(Boolean) : [];
                                        const fullName = fullNameArr.join(' ');

                                        let baseName = accountName;
                                        if (fullName && fullName.toLowerCase() !== accountName.toLowerCase()) {
                                            baseName = `${fullName} (${accountName})`;
                                        }

                                        const donorName = isMe ? `${baseName} ( Me )` : baseName;

                                        return (
                                            <div key={donation.id} className="py-1.5 px-4 sm:px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all flex flex-col gap-1.5">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center font-bold overflow-hidden border border-blue-100 shadow-sm flex-shrink-0">
                                                            {donation.user?.profile?.avatarUrl ? (
                                                                <img src={donation.user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-sm uppercase">{donorName.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm">{donorName}</p>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{formatDate(donation.donatedAt || donation.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-green-600 text-base">+{formatCurrency(Number(donation.amount))} VND</span>
                                                </div>

                                                {donation.message && (
                                                    <div className="ml-13 mb-1 text-xs text-gray-600 italic">
                                                        "{donation.message}"
                                                    </div>
                                                )}

                                                <div className="ml-13 mt-1 flex flex-col justify-center gap-0.5 min-h-[36px]">
                                                    {/* Line 1: Reference or Network */}
                                                    {donation.paymentMethod === 'PAYOS' && donation.paymentTransactions?.[0] ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">PayOS Ref:</span>
                                                            <span className="text-[10px] font-bold text-[#0891B2]">#{donation.paymentTransactions[0].orderId}</span>
                                                        </div>
                                                    ) : donation.paymentMethod === 'WALLET' ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Network:</span>
                                                            <span className="text-[10px] font-bold text-[#0891B2]">Polygon Amoy</span>
                                                        </div>
                                                    ) : null}

                                                    {/* Line 2: Verified Hash or Status */}
                                                    <div className="flex items-center gap-1">
                                                        {donation.txHash ? (
                                                            <>
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Verified:</span>
                                                                <code className="text-[10px] font-mono text-[#0891B2] bg-[#0891B2]/5 px-1 py-0.5 rounded border border-[#0891B2]/20">
                                                                    {donation.txHash.substring(0, 8)}...{donation.txHash.substring(donation.txHash.length - 6)}
                                                                </code>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`https://amoy.polygonscan.com/tx/${donation.txHash}`, '_blank');
                                                                    }}
                                                                    className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-500 hover:text-[#0891B2] transition-all border border-transparent hover:border-gray-200"
                                                                    title="View on PolygonScan"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </button>
                                                            </>
                                                        ) : donation.paymentMethod === 'PAYOS' ? (
                                                            <span className="text-[10px] font-black uppercase tracking-tighter italic text-amber-500">Syncing...</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center py-10 text-gray-500 italic">No donations yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div className="bg-white rounded-xl border-1 border-gray-300 shadow-sm h-[600px] flex flex-col overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-lg font-black text-gray-900 italic">Withdrawal History</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pb-2">
                            {withdrawals.length > 0 ? (
                                <div className="flex flex-col">
                                    {withdrawals.map((wd: any) => (
                                        <div key={wd.id} className="flex justify-between items-center py-1.5 px-4 sm:px-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all">
                                            <div>
                                                <div className="h-[38px] flex flex-col justify-center">
                                                    <p className="text-sm font-black text-gray-900 leading-tight line-clamp-2">{wd.reason || 'Withdrawal Request'}</p>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                    {formatDate(wd.createdAt)} · {wd.method === 'WALLET' ? '🔗 Blockchain' : '🏦 Bank'}
                                                </p>

                                                <div className="mt-1 flex flex-col justify-center gap-0.5 min-h-[36px] animate-in fade-in slide-in-from-top-1 duration-500">
                                                    {wd.method === 'BANK' && wd.bankName && (
                                                        <p className="text-[11px] text-gray-500 font-medium">{wd.bankName} · {wd.accountNumber}</p>
                                                    )}
                                                    {wd.method === 'WALLET' && wd.walletAddress && (
                                                        <p className="text-[10px] font-mono text-[#0891B2] break-all">{wd.walletAddress.slice(0, 16)}...</p>
                                                    )}
                                                    {wd.txHash ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">TxHash:</span>
                                                            <code className="text-[10px] font-mono text-[#0891B2] bg-[#0891B2]/5 px-1 py-0.5 rounded border border-[#0891B2]/20">
                                                                {wd.txHash.substring(0, 8)}...{wd.txHash.substring(wd.txHash.length - 6)}
                                                            </code>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(`https://amoy.polygonscan.com/tx/${wd.txHash}`, '_blank');
                                                                }}
                                                                className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-400 hover:text-[#0891B2] transition-all border border-transparent hover:border-gray-200"
                                                                title="View on PolygonScan"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] font-black uppercase tracking-tighter italic text-orange-400">Processing...</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4 flex-shrink-0">
                                                <p className="text-sm font-black text-red-500">-{formatCurrency(Number(wd.amount))} VND</p>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter inline-block mt-1 ${wd.status === 'DISBURSED' || wd.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : (wd.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700')}`}>
                                                    {wd.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-10 text-gray-500 italic">No withdrawals yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'news' && (
                    <div className="bg-white rounded-xl border-1 border-gray-300 p-6 shadow-sm h-[600px] flex flex-col">
                        <h3 className="text-lg font-black text-gray-900 italic mb-6 flex-shrink-0">Organizer News</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pl-4 space-y-6 pb-4">
                            {news.length > 0 ? (
                                news.map((item: any) => (
                                    <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-1 before:bg-cyan-100 rounded-lg" key={item.id}>
                                        <div className={`absolute left-[-5px] top-2 w-3 h-3 rounded-full ring-4 ring-white`} style={{ backgroundColor: TEAL }} />
                                        <span className="text-[10px] font-black mb-1 inline-block uppercase tracking-widest" style={{ color: TEAL }}>{formatDate(item.createdAt)}</span>
                                        <h4 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl whitespace-pre-wrap text-justify">
                                            {item.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-gray-500 italic">No news from the organizer yet.</p>
                            )}
                            <div className="h-20 flex-shrink-0" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
