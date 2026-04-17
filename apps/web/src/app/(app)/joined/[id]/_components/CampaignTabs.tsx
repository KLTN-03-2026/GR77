"use client";

import { useState } from "react";
import { Rss, HandCoins, Landmark } from "lucide-react";
import { formatCurrency, formatDate } from "../../../home/[id]/_utils/formatters";

// Mock Data
const mockDonations = [
    { id: 1, name: "Nguyen Van A", amount: 500000, date: "2026-04-10T10:00:00Z" },
    { id: 2, name: "Tran Thi B", amount: 200000, date: "2026-04-12T14:30:00Z" },
    { id: 3, name: "Anonymous User", amount: 100000, date: "2026-04-14T08:00:00Z" }
];

const mockWithdrawals = [
    { id: 1, amount: 10000000, status: "APPROVED", date: "2026-04-15T09:00:00Z", note: "Purchase construction materials" },
    { id: 2, amount: 5000000, status: "PENDING", date: "2026-04-16T10:00:00Z", note: "Transportation fees" },
];

const mockUpdates = [
    { id: 1, title: "Purchased 100 warm coats", content: "Thank you everyone, we have ordered 100 warm coats and will ship them tomorrow. We hope to continue receiving your support.", date: "2026-04-16T08:00:00Z" },
    { id: 2, title: "Trip departure", content: "The first truck has departed to the highlands. You can track the journey here.", date: "2026-04-17T09:00:00Z" }
];

export function CampaignTabs() {
    const [activeTab, setActiveTab] = useState<'donations' | 'withdrawals' | 'updates'>('updates');

    return (
        <div className="px-4 sm:px-8 pb-8 max-w-7xl mx-auto mt-8">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-gray-200 hide-scrollbar">
                <button
                    onClick={() => setActiveTab('updates')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap border ${activeTab === 'updates'
                        ? 'bg-cyan-50 border-2 border-cyan-500 text-cyan-700 shadow-sm'
                        : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
                        }`}
                >
                    <Rss className="w-5 h-5" /> Updates
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
                            {mockDonations.map(donation => (
                                <div key={donation.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {donation.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{donation.name}</p>
                                            <p className="text-sm text-gray-500">{formatDate(donation.date)}</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-green-600">+{formatCurrency(donation.amount)} VND</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'withdrawals' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Withdrawal History</h3>
                        <div className="space-y-4">
                            {mockWithdrawals.map(wd => (
                                <div key={wd.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-sm text-gray-500 font-medium">{formatDate(wd.date)}</span>
                                            <p className="font-semibold text-gray-800 mt-1">{wd.note}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-red-500">-{formatCurrency(wd.amount)} VND</p>
                                            <p className={`text-xs font-bold mt-1 inline-block px-2 py-1 rounded-md ${wd.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {wd.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'updates' && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Organizer Updates</h3>
                        <div className="space-y-6">
                            {mockUpdates.map(update => (
                                <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-1 before:bg-blue-100 rounded-lg" key={update.id}>
                                    <div className="absolute left-[-5px] top-2 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white" />
                                    <span className="text-sm font-bold text-blue-600 mb-1 inline-block">{formatDate(update.date)}</span>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">{update.title}</h4>
                                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl">
                                        {update.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
