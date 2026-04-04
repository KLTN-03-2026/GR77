"use client";

import React from "react";

interface CampaignGoalProgressProps {
    raisedPercent: number;
    fundingGoal: number;
    totalRaised: number;
    isJoined: boolean;
    isCreator?: boolean;
    campaignId?: string;
    setDonateOpen: (open: boolean) => void;
    handleJoin: () => void;
    formatCurrency: (amount: number | string) => string;
}

export function CampaignGoalProgress({
    raisedPercent,
    fundingGoal,
    totalRaised,
    isJoined,
    isCreator,
    campaignId,
    setDonateOpen,
    handleJoin,
    formatCurrency
}: CampaignGoalProgressProps) {
    return (
        <section className="bg-white border border-gray-100 rounded-[3.5rem] p-10 shadow-xl shadow-gray-200/50">
            <div className="flex flex-col md:flex-row items-center gap-16 justify-between">
                <div className="relative w-56 h-56 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                        <path className="text-black" strokeDasharray={`${raisedPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-gray-900">{raisedPercent}%</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Raised</span>
                    </div>
                </div>

                <div className="flex-1 space-y-6 w-full max-w-md">
                    <div className="flex justify-between p-4 bg-gray-50 rounded-2xl items-center">
                        <span className="font-bold text-gray-500">Goal Amount:</span>
                        <span className="font-black text-gray-900 text-xl">{formatCurrency(fundingGoal)} VNĐ</span>
                    </div>
                    <div className="flex justify-between p-4 bg-gray-50 rounded-2xl items-center">
                        <span className="font-bold text-gray-500">Total Raised:</span>
                        <span className="font-black text-black text-xl">{formatCurrency(totalRaised)} VNĐ</span>
                    </div>

                    {!isCreator ? (
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDonateOpen(true)}
                                className="flex-1 py-5 bg-[#FFD700] hover:bg-yellow-400 text-white font-black text-2xl rounded-full shadow-lg shadow-yellow-200/50 transition-all active:scale-95"
                            >
                                Donate
                            </button>
                            <button
                                onClick={handleJoin}
                                disabled={isJoined}
                                className="px-10 py-5 bg-gray-900 text-white font-black rounded-full hover:bg-black transition-all disabled:opacity-50"
                            >
                                {isJoined ? "Joined" : "Join Free"}
                            </button>
                        </div>
                    ) : (
                        <div className="pt-2">
                            <a
                                href={`/creator/campaigns/${campaignId}`}
                                className="block w-full py-5 bg-blue-500 hover:bg-blue-600 text-white font-black text-xl rounded-full text-center shadow-lg shadow-blue-100 transition-all active:scale-95"
                            >
                                Quản lý chiến dịch
                            </a>
                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                                Đây là chiến dịch do bạn tổ chức
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
