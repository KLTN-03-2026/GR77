import React from 'react';

interface TimelineSectionProps {
    campaign?: any;
}

export function TimelineSection({ campaign = {} }: TimelineSectionProps) {
    const isLocked = campaign?.id ? (
        (campaign.currentAmount > 0) || 
        (campaign.startAt && new Date(campaign.startAt) <= new Date())
    ) : false;

    return (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <label className="text-[14px] font-black text-gray-900 uppercase tracking-widest mb-4 block">Campaign Timeline</label>
            <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Start Date</span>
                    <input
                        type="date"
                        name="startAt"
                        defaultValue={campaign?.startAt ? new Date(campaign.startAt).toISOString().split('T')[0] : ''}
                        required={!isLocked}
                        disabled={isLocked}
                        className="w-full sm:w-44 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                </div>
                <div className="hidden sm:block h-0.5 w-4 bg-gray-300 rounded-full mt-5"></div>
                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">End Date</span>
                    <input
                        type="date"
                        name="endAt"
                        defaultValue={campaign?.endAt ? new Date(campaign.endAt).toISOString().split('T')[0] : ''}
                        required
                        className="w-full sm:w-44 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
                    />
                </div>

                <label className="flex items-center gap-3 ml-auto bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors mt-4 sm:mt-0">
                    <input
                        type="checkbox"
                        name="autoCloseWhenGoalReached"
                        defaultChecked={campaign?.autoCloseWhenGoalReached || false}
                        className="w-5 h-5 rounded-md text-blue-500 border-gray-300 focus:ring-blue-400 focus:ring-offset-0 transition-all"
                    />
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-gray-900">Auto-close Goal</span>
                        <span className="text-[10px] text-gray-400 font-medium">Stop when target reached</span>
                    </div>
                </label>
            </div>
        </div>
    );
}
