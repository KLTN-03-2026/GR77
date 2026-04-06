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
        <section className="w-full">
            <div className="flex flex-col items-center gap-20 justify-between">
                <div className="relative w-80 h-80 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                        <path className="text-black" strokeDasharray={`${raisedPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-gray-900">{raisedPercent}%</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Raised</span>
                    </div>
                </div>

                <div className="flex-1 space-y-10 w-full max-w-md">
                    {/* Progress Stats */}
                    <div className="flex justify-between p-4 bg-gray-100 border border-gray-200 rounded-xl items-center">
                        <span className="font-bold text-gray-600">Goal Amount:</span>
                        <span className="font-black text-gray-900 text-lg">{formatCurrency(fundingGoal)} VNĐ</span>
                    </div>
                    <div className="flex justify-between p-4 bg-gray-100 border border-gray-200 rounded-xl items-center">
                        <span className="font-bold text-gray-600">Total Raised:</span>
                        <span className="font-black text-gray-900 text-lg">{formatCurrency(totalRaised)} VNĐ</span>
                    </div>

                    {!isCreator ? (
                        <div className="flex gap-4 pt-2">
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
                        <div className="pt-4">
                            <a
                                href={`/creator/campaigns/${campaignId}`}
                                className="block w-full py-5 bg-blue-500 hover:bg-blue-600 text-white font-black text-xl text-center rounded-full shadow-lg shadow-blue-100 transition-all active:scale-95"
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
