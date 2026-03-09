'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export default function NewCampaignPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            locationText: formData.get('locationText') as string,
            fundingGoalAmount: Number(formData.get('fundingGoalAmount')),
            minimumDonationAmount: Number(formData.get('minimumDonationAmount')),
            startAt: new Date(formData.get('startAt') as string).toISOString(),
            endAt: new Date(formData.get('endAt') as string).toISOString(),
            autoCloseWhenGoalReached: formData.get('autoCloseWhenGoalReached') === 'on',
        };

        try {
            // Note: you may need to update the URL and handle the auth token properly based on your auth implementation
            const token = localStorage.getItem('accessToken');

            const response = await fetch('http://localhost:3001/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('accessToken');
                    router.push('/login');
                    return;
                }
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to create campaign');
            }

            // Redirect to campaigns list on success
            router.push('/creator/campaigns');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto pb-20">

            {/* Header */}
            <h1 className="text-xl font-extrabold text-[#1a1a1a] mb-10 tracking-tight flex items-center gap-3">
                My Campaigns <ChevronRightIcon className="h-5 w-5 stroke-[3]" /> Add
            </h1>

            {/* Form Container */}
            <div className="max-w-4xl bg-white">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form className="space-y-6" onSubmit={handleSubmit}>

                    {/* Campaign Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Campaign Title
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <input
                                type="text"
                                name="title"
                                className="w-full bg-[#f4f4f4] border border-transparent rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2">
                            Description
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <textarea
                                name="description"
                                rows={4}
                                className="w-full bg-[#f4f4f4] border border-transparent rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Category
                        </label>
                        <div className="sm:w-3/4 flex">
                            <select
                                name="category"
                                className="w-40 bg-[#f4f4f4] border border-transparent rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                            >
                                <option value="">Choose</option>
                                <option value="education">Education</option>
                                <option value="health">Health</option>
                                <option value="environment">Environment</option>
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Location
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <input
                                type="text"
                                name="locationText"
                                className="w-full bg-[#f4f4f4] border border-transparent rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Cover Image
                        </label>
                        <div className="sm:w-3/4">
                            <button type="button" className="w-48 bg-[#c2e2f6] border border-transparent rounded-lg px-4 py-2.5 text-sm text-transparent overflow-hidden h-10">
                                Upload (Placeholder)
                            </button>
                        </div>
                    </div>

                    {/* Funding Goal Amount */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Funding Goal Amount
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4 flex items-center gap-3">
                            <input
                                type="number"
                                name="fundingGoalAmount"
                                className="w-48 bg-[#f4f4f4] border border-transparent rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                            <span className="text-[13px] font-bold text-gray-900">VND</span>
                        </div>
                    </div>

                    {/* Minimum Donation Amount */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Minimum Donation Amount
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4 flex items-center gap-3">
                            <input
                                type="number"
                                name="minimumDonationAmount"
                                className="w-48 bg-[#f4f4f4] border border-transparent rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                            <span className="text-[13px] font-bold text-gray-900">VND</span>
                        </div>
                    </div>

                    {/* Timeline (Start Date & End Date) & Auto-close checkbox */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6 py-2">
                        <label className="lg:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Timeline
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="lg:w-3/4 flex flex-wrap items-center gap-4">
                            <input
                                type="date"
                                name="startAt"
                                className="w-40 bg-[#f4f4f4] border border-transparent rounded-lg px-3 py-2 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                            <span className="text-gray-400 font-bold">--</span>
                            <input
                                type="date"
                                name="endAt"
                                className="w-40 bg-[#f4f4f4] border border-transparent rounded-lg px-3 py-2 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />

                            <label className="flex items-center gap-2 ml-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="autoCloseWhenGoalReached"
                                    className="w-4 h-4 rounded text-blue-500 border-gray-300 focus:ring-blue-400 focus:ring-offset-0 bg-[#e5e5e5]"
                                />
                                <span className="text-[12px] font-bold text-gray-900">Auto-close When Goal Reached?</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-12 pb-6 flex justify-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-[#4fb3fc] to-[#45a8f7] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-black text-sm px-16 py-3.5 rounded-[12px] shadow-[0_4px_14px_0_rgba(79,179,252,0.39)] transition-all uppercase tracking-wide"
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
