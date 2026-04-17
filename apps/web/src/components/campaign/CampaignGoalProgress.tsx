import React from "react";
import FavoriteButton from "./FavoriteButton";

interface CampaignGoalProgressProps {
    raisedPercent: number;
    fundingGoal: number;
    totalRaised: number;
    participantsCount?: number;
    isJoined: boolean;
    isLiked: boolean;
    isCreator?: boolean;
    campaignId: string;
    setDonateOpen: (open: boolean) => void;
    handleJoin: () => void;
    handleLeave?: () => void;
    handleToggleLike: (id: string, isFavorited: boolean) => void;
    formatCurrency: (amount: number | string) => string;
}

export function CampaignGoalProgress({
    raisedPercent,
    fundingGoal,
    totalRaised,
    participantsCount,
    isJoined,
    isLiked,
    isCreator,
    campaignId,
    setDonateOpen,
    handleJoin,
    handleLeave,
    handleToggleLike,
    formatCurrency
}: CampaignGoalProgressProps) {
    return (
        <section className="w-full h-full flex flex-col">
            <div className="flex flex-col items-center flex-1 w-full">

                {/* 1. Pie Chart Area - Centered in top half */}
                <div className="flex-1 flex flex-col justify-center w-full items-center py-4">
                    <div className="relative w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.2" />
                            <path className="text-black" strokeDasharray={`${raisedPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900">{raisedPercent}%</span>
                            <span className="text-[8px] sm:text-[10px] lg:text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Raised</span>
                        </div>
                    </div>
                </div>

                {/* 2. Progress Stats Area - Centered in Middle */}
                <div className="flex-1 flex flex-col justify-center w-full max-w-md py-4">
                    <div className="space-y-3 w-full">
                        <div className="flex justify-between p-4 bg-gray-50 border border-gray-200 rounded-[20px] items-center shadow-sm">
                            <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">Goal</span>
                            <span className="font-black text-gray-900 text-sm sm:text-lg">{formatCurrency(fundingGoal)} VND</span>
                        </div>
                        <div className="flex justify-between p-4 bg-gray-50 border border-gray-200 rounded-[20px] items-center shadow-sm">
                            <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">Raised</span>
                            <span className="font-black text-gray-900 text-sm sm:text-base lg:text-lg">{formatCurrency(totalRaised)} VND</span>
                        </div>
                        {participantsCount !== undefined && (
                            <div className="flex justify-between p-4 bg-cyan-50 border border-cyan-100 rounded-[20px] items-center shadow-sm">
                                <span className="text-xs sm:text-sm font-bold text-cyan-600 uppercase tracking-widest">Joined</span>
                                <span className="font-black text-cyan-700 text-sm sm:text-lg">{participantsCount} Member{participantsCount !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Buttons Area - Anchored Bottom */}
                {!isCreator ? (
                    <div className="w-full shrink-0 pt-6">
                        <div className="flex gap-4">
                            {isJoined && !handleLeave ? (
                                <button
                                    disabled
                                    className="flex-1 py-2.5 sm:py-3 border-2 border-gray-200 font-black text-sm sm:text-base rounded-full bg-gray-50 text-gray-400 cursor-not-allowed shadow-none"
                                >
                                    Joined
                                </button>
                            ) : (
                                <button
                                    onClick={isJoined ? handleLeave : handleJoin}
                                    className={`flex-1 py-2.5 sm:py-3 border-2 font-black text-sm sm:text-base rounded-full transition-all active:scale-95 shadow-lg ${isJoined
                                        ? "bg-white border-red-500 text-red-500 hover:bg-red-50 shadow-red-100/50"
                                        : "bg-white border-pink-500 text-pink-500 hover:bg-pink-50 shadow-pink-100/50"
                                        }`}
                                >
                                    {isJoined ? "Leave" : "Join Free"}
                                </button>
                            )}
                            <button
                                onClick={() => setDonateOpen(true)}
                                className="flex-1 py-2.5 sm:py-3 bg-white border-2 border-yellow-400 text-yellow-600 hover:bg-[#FFF9E0] font-black text-sm sm:text-base rounded-full shadow-lg shadow-yellow-100/50 transition-all active:scale-95"
                            >
                                Donate
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full shrink-0 pt-6 flex justify-center">
                        <a
                            href={`/creator/campaigns/${campaignId}`}
                            className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-cyan-600 border border-cyan-600 bg-cyan-50 hover:bg-cyan-100 text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                        >
                            Manage Campaign
                        </a>
                    </div>
                )}

            </div>
        </section>
    );
}
