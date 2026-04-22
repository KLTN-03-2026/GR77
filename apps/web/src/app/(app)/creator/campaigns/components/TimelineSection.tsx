import React, { useState } from 'react';

interface TimelineSectionProps {
    campaign?: any;
    fieldErrors?: Record<string, string>;
}

export function TimelineSection({ campaign = {}, fieldErrors = {} }: TimelineSectionProps) {
    const isLocked = campaign?.id ? (
        (campaign.currentAmount > 0) || 
        (campaign.startAt && new Date(campaign.startAt) <= new Date())
    ) : false;

    // Today's date in YYYY-MM-DD (local timezone) — cannot pick earlier
    const todayStr = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"

    const defaultStart = campaign?.startAt
        ? new Date(campaign.startAt).toLocaleDateString('en-CA')
        : '';
    const defaultEnd = campaign?.endAt
        ? new Date(campaign.endAt).toLocaleDateString('en-CA')
        : '';

    const [startDate, setStartDate] = useState<string>(defaultStart);
    const [endDate, setEndDate] = useState<string>(defaultEnd);

    // Minimum end date = start date + 1 day (or today + 1 if no start picked yet)
    const computeMinEnd = (start: string): string => {
        const base = start || todayStr;
        const d = new Date(base);
        d.setDate(d.getDate() + 1);
        return d.toLocaleDateString('en-CA');
    };

    const minEndDate = computeMinEnd(startDate);

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        setStartDate(newStart);
        // If current end date is no longer valid, clear it
        if (endDate && endDate <= newStart) {
            setEndDate('');
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <label className="text-[14px] font-black text-gray-900 uppercase tracking-widest mb-4 block">Campaign Timeline</label>
            <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Start Date <span className="text-red-500 ml-1">*</span></span>
                    <input
                        type="date"
                        name="startAt"
                        value={startDate}
                        min={todayStr}
                        onChange={handleStartChange}
                        required={!isLocked}
                        disabled={isLocked}
                        className={`w-full sm:w-44 bg-white border ${fieldErrors.startAt ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-4 outline-none transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100`}
                    />
                    {fieldErrors.startAt && (
                        <p className="text-red-500 text-xs font-semibold mt-1 ml-1 max-w-[176px] leading-tight">{fieldErrors.startAt}</p>
                    )}
                </div>
                <div className="hidden sm:block h-0.5 w-4 bg-gray-300 rounded-full mt-5"></div>
                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">End Date <span className="text-red-500 ml-1">*</span></span>
                    <input
                        type="date"
                        name="endAt"
                        value={endDate}
                        min={minEndDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className={`w-full sm:w-44 bg-white border ${fieldErrors.endAt ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-4 outline-none transition-all shadow-sm`}
                    />
                    {fieldErrors.endAt && (
                        <p className="text-red-500 text-xs font-semibold mt-1 ml-1 max-w-[176px] leading-tight">{fieldErrors.endAt}</p>
                    )}
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
