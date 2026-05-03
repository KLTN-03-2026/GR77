"use client";

import { useState } from "react";
import { Rss, HandCoins, Landmark, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "../../../home/[id]/_utils/formatters";

interface CampaignTabsProps {
    campaign: any;
    currentUser: any;
}

export function CampaignTabs({ campaign, currentUser }: CampaignTabsProps) {
    const [activeTab, setActiveTab] = useState<'donations' | 'withdrawals' | 'news'>('news');

    const donations = campaign?.donations || [];
    const withdrawals = campaign?.withdrawalRequests || [];

    const [visibleDonationsCount, setVisibleDonationsCount] = useState(3);

    const handleShowMore = () => {
        setVisibleDonationsCount(prev => prev + 5);
    };

    const handleShowLess = () => {
        setVisibleDonationsCount(prev => Math.max(3, prev - 5));
    };

    const displayedDonations = donations.slice(0, visibleDonationsCount);

    return (
        <div className="px-4 sm:px-8 pb-8 max-w-7xl mx-auto mt-8">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-gray-200 hide-scrollbar">
                <button
                    onClick={() => setActiveTab('news')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap border ${activeTab === 'news'
                        ? 'bg-cyan-50 border-2 border-cyan-500 text-cyan-700 shadow-sm'
                        : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    <Rss className="w-5 h-5" /> News
                </button>
                <button
                    onClick={() => setActiveTab('donations')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap border ${activeTab === 'donations'
                        ? 'bg-cyan-50 border-2 border-cyan-500 text-cyan-700 shadow-sm'
                        : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    <HandCoins className="w-5 h-5" /> Donations
                </button>
                <button
                    onClick={() => setActiveTab('withdrawals')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap border ${activeTab === 'withdrawals'
                        ? 'bg-cyan-50 border-2 border-cyan-500 text-cyan-700 shadow-sm'
                        : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    <Landmark className="w-5 h-5" /> Withdrawals
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'donations' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Donation History</h3>
                        <div className="space-y-4">
                            {donations.length > 0 ? (
                                <>
                                    {displayedDonations.map((donation: any) => {
                                        const profile = donation.user?.profile;
                                        const isMe = donation.userId === currentUser?.id;
                                        const accountName = donation.user?.username || "Khách vãng lai";
                                        const fullNameArr = profile ? [profile.lastName, profile.firstName].filter(Boolean) : [];
                                        const fullName = fullNameArr.join(' ');

                                        let baseName = accountName;
                                        if (fullName && fullName.toLowerCase() !== accountName.toLowerCase()) {
                                            baseName = `${fullName} (${accountName})`;
                                        }

                                        const donorName = isMe ? `${baseName} ( Tôi )` : baseName;

                                        return (
                                            <div key={donation.id} className="p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 shadow-sm">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center font-bold overflow-hidden border border-blue-100 shadow-sm">
                                                            {donation.user?.profile?.avatarUrl ? (
                                                                <img src={donation.user.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-base uppercase">{donorName.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {donorName}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{formatDate(donation.donatedAt || donation.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-green-600 text-lg">+{formatCurrency(Number(donation.amount))} VND</span>
                                                </div>
                                                {donation.message && (
                                                    <div className="ml-16 mt-2 p-3 bg-white/60 rounded-xl border border-gray-100 text-sm text-gray-600 italic leading-relaxed">
                                                        "{donation.message}"
                                                    </div>
                                                )}

                                                <div className="ml-16 mt-3 flex flex-col gap-2">
                                                    {/* Banking Reference (PayOS) */}
                                                    {donation.paymentMethod === 'PAYOS' && donation.paymentTransactions?.[0] && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Mã đơn PayOS:</span>
                                                            <span className="text-[11px] font-bold text-gray-600">#{donation.paymentTransactions[0].orderId}</span>
                                                        </div>
                                                    )}

                                                    {/* On-chain Verification Hash */}
                                                    {donation.txHash ? (
                                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Xác thực On-chain:</span>
                                                            <code className="text-[11px] font-mono text-[#0891B2] bg-cyan-50/50 px-2 py-1 rounded border border-cyan-100/50">
                                                                {donation.txHash.substring(0, 10)}...{donation.txHash.substring(donation.txHash.length - 8)}
                                                            </code>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(`https://amoy.polygonscan.com/tx/${donation.txHash}`, '_blank');
                                                                }}
                                                                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-[#0891B2] transition-all border border-transparent hover:border-gray-200"
                                                                title="Xem trên PolygonScan"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : donation.paymentMethod === 'PAYOS' && (
                                                        <div className="flex items-center gap-2 text-amber-500">
                                                            <span className="text-[10px] font-black uppercase tracking-tighter italic">Đang đồng bộ on-chain...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {(donations.length > visibleDonationsCount || visibleDonationsCount > 3) && (
                                        <div className="flex justify-center gap-4 pt-4">
                                            {donations.length > visibleDonationsCount && (
                                                <button
                                                    onClick={handleShowMore}
                                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border-2 border-cyan-500 text-cyan-600 font-bold hover:bg-cyan-50 transition-all shadow-sm active:scale-95"
                                                >
                                                    Xem thêm <ChevronDown className="w-4 h-4" />
                                                </button>
                                            )}
                                            {visibleDonationsCount > 3 && (
                                                <button
                                                    onClick={handleShowLess}
                                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                                                >
                                                    Thu gọn <ChevronUp className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-center py-8 text-gray-500 italic">No donations yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Withdrawal History</h3>
                        <div className="space-y-4">
                            {withdrawals.length > 0 ? (
                                withdrawals.map((wd: any) => (
                                    <div key={wd.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-sm text-gray-500 font-medium">{formatDate(wd.createdAt)}</span>
                                                <p className="font-semibold text-gray-800 mt-1">{wd.reason || "Withdrawal request"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-red-500">-{formatCurrency(Number(wd.amount))} VND</p>
                                                <p className={`text-xs font-bold mt-1 inline-block px-2 py-1 rounded-md ${wd.status === 'DISBURSED' ? 'bg-green-100 text-green-700' : (wd.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700')}`}>
                                                    {wd.status}
                                                </p>
                                            </div>
                                        </div>
                                        {wd.txHash && (
                                            <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-3">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">On-chain:</span>
                                                <code className="text-[11px] font-mono text-[#E11D48] bg-rose-50/50 px-2 py-1 rounded border border-rose-100/50">
                                                    {wd.txHash.substring(0, 10)}...{wd.txHash.substring(wd.txHash.length - 8)}
                                                </code>
                                                <button
                                                    onClick={() => window.open(`https://amoy.polygonscan.com/tx/${wd.txHash}`, '_blank')}
                                                    className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-rose-600 transition-all border border-transparent hover:border-gray-100"
                                                    title="View on PolygonScan"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-gray-500 italic">No withdrawals yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'news' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Organizer News</h3>
                        <div className="space-y-6">
                            {campaign?.news?.length > 0 ? (
                                campaign.news.map((item: any) => (
                                    <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-1 before:bg-blue-100 rounded-lg" key={item.id}>
                                        <div className="absolute left-[-5px] top-2 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white" />
                                        <span className="text-sm font-bold text-blue-600 mb-1 inline-block">{formatDate(item.createdAt)}</span>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl whitespace-pre-wrap">
                                            {item.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-8 text-gray-500 italic">No news from the organizer yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
