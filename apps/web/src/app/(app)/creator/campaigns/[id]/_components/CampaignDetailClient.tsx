'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    MapPinIcon,
    TagIcon,
    CalendarIcon,
    WalletIcon,
    ChatBubbleLeftEllipsisIcon,
    ShareIcon,
    HeartIcon,
    EllipsisHorizontalIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// Mock data (có thể mở rộng để fetch từ API ở đây nếu muốn)
const campaignData = {
    id: 'CAMP-001',
    title: 'Safe Haven: Building a Community Center for Orphaned Children',
    description: 'Our mission is to provide a safe, nurturing environment for orphaned children where they can learn, grow, and thrive. This community center will offer educational programs, vocational training, and emotional support services to help these children build a brighter future for themselves and their communities.',
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop',
    category: 'Social Welfare',
    location: 'Ho Chi Minh City, Vietnam',
    status: 'ACTIVE',
    amountRaised: 45800000,
    goal: 100000000,
    createdAt: 'Oct 12, 2023',
    donorsCount: 124,
    creator: {
        name: 'Kindlink Foundation',
        avatar: 'https://i.pravatar.cc/150?u=kindlink',
        isVerified: true
    },
    comments: [
        { id: 1, user: 'Nguyen Van A', avatar: 'https://i.pravatar.cc/150?u=a', text: 'This is such a meaningful campaign. I hope more people join to support the children.', time: '2 hours ago' },
        { id: 2, user: 'Tran Thi B', avatar: 'https://i.pravatar.cc/150?u=b', text: 'Wishing the campaign a great success!', time: '5 hours ago' },
        { id: 3, user: 'Le Van C', avatar: 'https://i.pravatar.cc/150?u=c', text: 'I have shared this with my friends. Good luck!', time: '1 day ago' },
    ]
};

export default function CampaignDetailClient({ id }: { id: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const progress = (campaignData.amountRaised / campaignData.goal) * 100;

    return (
        <div className="w-full max-w-6xl mx-auto pb-20 text-gray-800">
            {/* Breadcrumbs / Back navigation */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href="/creator/campaigns"
                    className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" strokeWidth={2.5} />
                    Back to Campaigns
                </Link>
                <div className="flex gap-3">
                    <button className="p-2.5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:bg-gray-50 transition-all active:scale-95 group" title="Share">
                        <ShareIcon className="h-5 w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                    </button>
                    <Link
                        href={`/creator/campaigns/${id}/edit`}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white border border-blue-100 text-blue-600 font-bold text-sm shadow-sm hover:bg-blue-50 transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit Campaign
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Cover, Info, Comments */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Cover Image */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5">
                        <img
                            src={campaignData.coverImage}
                            alt={campaignData.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-6 right-6">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg hover:scale-105 transition-all text-[#ff545e]"
                            >
                                {isLiked ? <HeartIconSolid className="h-6 w-6" /> : <HeartIcon className="h-6 w-6" />}
                            </button>
                        </div>
                        <div className="absolute bottom-6 left-6">
                            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                                <TagIcon className="h-4 w-4 text-blue-500 font-bold" strokeWidth={2.5} />
                                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{campaignData.category}</span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Info */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
                            {campaignData.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-8 py-4 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">{campaignData.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Created: {campaignData.createdAt}</span>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">About this campaign</h3>
                            <p className="text-gray-600 leading-relaxed text-base">
                                {campaignData.description}
                            </p>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-blue-500" />
                                <h2 className="text-xl font-bold text-gray-900">Comments</h2>
                                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {campaignData.comments.length}
                                </span>
                            </div>
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View all</button>
                        </div>

                        <div className="space-y-6">
                            {campaignData.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left items-start">
                                    <img
                                        src={comment.avatar}
                                        alt={comment.user}
                                        className="h-10 w-10 rounded-xl object-cover ring-2 ring-white"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-900">{comment.user}</span>
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{comment.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {comment.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                    K
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="w-full bg-gray-100 border-transparent rounded-2xl py-2.5 px-5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder-gray-400 font-medium"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-xl hover:bg-blue-600 transition-colors shadow-sm">
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Status, Funding, Wallet Button, Creator */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Status and Funding Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-blue-50/50 sticky top-28">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Campaign Status</span>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 ${campaignData.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-600 border border-green-100'
                                    : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                                }`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${campaignData.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                {campaignData.status}
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-3xl font-black text-gray-900">{campaignData.amountRaised.toLocaleString()}</span>
                                <span className="text-sm font-bold text-gray-400 uppercase">VND</span>
                            </div>
                            <p className="text-sm font-medium text-gray-500">
                                raised of <span className="font-bold text-gray-700">{campaignData.goal.toLocaleString()} VND</span> goal
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-gray-100 rounded-full mb-6 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <div className="text-lg font-bold text-gray-900">{campaignData.donorsCount}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Donors</div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                <div className="text-lg font-bold text-gray-900">12</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Days Left</div>
                            </div>
                        </div>

                        {/* Wallet Button */}
                        <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] transition-all active:scale-[0.98] mb-4 group">
                            <WalletIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                            Connect Wallet to Support
                        </button>
                        <p className="text-center text-[11px] text-gray-400 font-medium">
                            Secure payments powered by Kindlink Blockchain
                        </p>

                        <div className="mt-8 pt-8 border-t border-gray-50 text-left">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img src={campaignData.creator.avatar} alt={campaignData.creator.name} className="h-12 w-12 rounded-2xl object-cover shadow-sm" />
                                    {campaignData.creator.isVerified && (
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                            <CheckBadgeIcon className="h-4 w-4 text-blue-500" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Created by</div>
                                    <div className="text-sm font-bold text-gray-900">{campaignData.creator.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
