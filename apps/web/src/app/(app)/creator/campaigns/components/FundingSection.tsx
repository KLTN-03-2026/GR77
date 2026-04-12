import React from 'react';

interface FundingSectionProps {
    campaign?: any;
}

export function FundingSection({ campaign = {} }: FundingSectionProps) {
    const isLocked = campaign?.id ? (
        (campaign.currentAmount > 0) ||
        (campaign.startAt && new Date(campaign.startAt) <= new Date())
    ) : false;

    return (
        <div className="space-y-8 mt-8">

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                    Funding Goal Amount
                </label>
                <div className="sm:w-3/4">
                    <div className="relative inline-block w-full sm:w-96">
                        <input
                            type="number"
                            name="fundingGoalAmount"
                            defaultValue={campaign.fundingGoalAmount}
                            required={!isLocked}
                            disabled={isLocked}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-5 pr-14 py-3 text-sm text-[#000000] font-bold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">VND</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                    Minimum Donation
                </label>
                <div className="sm:w-3/4">
                    <div className="relative inline-block w-full sm:w-96">
                        <input
                            type="number"
                            name="minimumDonationAmount"
                            defaultValue={campaign.minimumDonationAmount}
                            required={!isLocked}
                            disabled={isLocked}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-5 pr-14 py-3 text-sm text-[#000000] font-bold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">VND</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
