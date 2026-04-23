'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useEditCampaign } from './hooks/useEditCampaign';
import { BasicInfoSection } from '@/app/(app)/creator/campaigns/components/BasicInfoSection';
import { MediaSection } from '@/app/(app)/creator/campaigns/components/MediaSection';
import { FundingSection } from '@/app/(app)/creator/campaigns/components/FundingSection';
import { TimelineSection } from '@/app/(app)/creator/campaigns/components/TimelineSection';

export default function EditCampaignClient({ id }: { id: string }) {
    const {
        isLoading,
        isSaving,
        error,
        campaign,
        categories,
        selectedCategoryId,
        setSelectedCategoryId,
        imagePreview,
        fileInputRef,
        removeImage,
        handleImageChange,
        galleryPreviews,
        galleryInputRef,
        removeGalleryImage,
        handleGalleryChange,
        handleSubmit,
        handleFormChange,
        fieldErrors,
        router
    } = useEditCampaign(id);

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <ArrowPathIcon className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium tracking-wide">Loading campaign data...</p>
            </div>
        );
    }

    if (!campaign && !isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold">
                    Campaign not found or an error occurred.
                </div>
                <Link href="/creator/campaigns" className="text-blue-500 font-bold hover:underline">
                    Back to My Campaigns
                </Link>
            </div>
        );
    }

    const isLocked = campaign?.id ? (
        (campaign.currentAmount > 0) || 
        (campaign.startAt && new Date(campaign.startAt) <= new Date())
    ) : false;

    return (
        <div className="w-full pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <PencilSquareIcon className="w-7 h-7 text-cyan-500" />
                    Edit Campaign
                </h1>
                <p className="text-sm text-gray-400 mt-1 ml-9">Update your campaign details below.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                {isLocked && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm font-semibold flex items-start gap-3 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                        <div>
                            <p className="font-bold">Campaign is currently active or has received donations.</p>
                            <p className="font-medium text-xs mt-1 text-amber-600">Key details such as Title, Funding Goal, Minimum Donation, and Start Date have been locked to ensure transparency.</p>
                        </div>
                    </div>
                )}

                <form className="space-y-8" onSubmit={handleSubmit} onChange={handleFormChange}>

                    <BasicInfoSection
                        campaign={campaign}
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        setSelectedCategoryId={setSelectedCategoryId}
                        fieldErrors={fieldErrors}
                    />

                    <MediaSection
                        imagePreview={imagePreview}
                        fileInputRef={fileInputRef}
                        removeImage={removeImage}
                        handleImageChange={handleImageChange}
                        galleryPreviews={galleryPreviews}
                        galleryInputRef={galleryInputRef}
                        removeGalleryImage={removeGalleryImage}
                        handleGalleryChange={handleGalleryChange}
                        fieldErrors={fieldErrors}
                    />

                    <FundingSection campaign={campaign} fieldErrors={fieldErrors} />

                    <TimelineSection campaign={campaign} fieldErrors={fieldErrors} />

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm anim-up-0">
                            <div className="h-2 w-2 rounded-full bg-red-500 shrink-0"></div>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/creator/campaigns')}
                            className="w-full sm:w-auto bg-white hover:bg-red-500/10 border-2 border-red-500 text-red-500 font-black text-sm px-12 py-3 rounded-full transition-colors uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto bg-white hover:bg-[#00D118]/10 border-2 border-[#00D118] text-[#00D118] disabled:opacity-70 disabled:grayscale font-black text-sm px-8 md:px-12 py-3 rounded-full transition-colors uppercase tracking-wider flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {isSaving ? (
                                <>
                                    <ArrowPathIcon className="h-5 w-5 animate-spin disabled:opacity-70" />
                                    Updating...
                                </>
                            ) : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
