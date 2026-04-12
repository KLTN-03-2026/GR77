'use client';

import React from 'react';
import { ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useCreateCampaign } from './hooks/useCreateCampaign';
import { BasicInfoSection } from '@/app/(app)/creator/campaigns/components/BasicInfoSection';
import { MediaSection } from '@/app/(app)/creator/campaigns/components/MediaSection';
import { FundingSection } from '@/app/(app)/creator/campaigns/components/FundingSection';
import { TimelineSection } from '@/app/(app)/creator/campaigns/components/TimelineSection';

export default function NewCampaignPage() {
    const {
        isLoading,
        error,
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
        router
    } = useCreateCampaign();

    return (
        <div className="w-full pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ChevronRightIcon className="w-7 h-7 text-cyan-500" />
                    Create New Campaign
                </h1>
                <p className="text-sm text-gray-400 mt-1 ml-9">Fill out the information below to start raising funds.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">

                <form className="space-y-8" onSubmit={handleSubmit}>

                    <BasicInfoSection
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        setSelectedCategoryId={setSelectedCategoryId}
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
                    />

                    <FundingSection />

                    <TimelineSection />

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
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-white hover:bg-[#00D118]/10 border-2 border-[#00D118] text-[#00D118] disabled:opacity-70 disabled:grayscale font-black text-sm px-8 md:px-12 py-3 rounded-full transition-colors uppercase tracking-wider flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <ArrowPathIcon className="h-5 w-5 animate-spin disabled:opacity-70" />
                                    Saving...
                                </>
                            ) : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
