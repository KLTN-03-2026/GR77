"use client";

import { use } from "react";
import { useGlobalAuth } from "@/contexts/AuthContext";

// Shared Components
import { CampaignDiscussion } from "@/components/campaign/CampaignDiscussion";

// Local Sub-components
import { CampaignHero } from "./_components/CampaignHero";
import { CampaignDescription } from "./_components/CampaignDescription";
import { CampaignOverviewBox } from "./_components/CampaignOverviewBox";
import { CampaignGalleryBox } from "./_components/CampaignGalleryBox";
import { CampaignSidebar } from "./_components/CampaignSidebar";
import { CampaignModals } from "./_components/CampaignModals";

// Hooks & Utils
import { useCampaignDetail } from "./_hooks/useCampaignDetail";
import { formatCurrency, formatDate } from "./_utils/formatters";

declare global {
    interface Window {
        ethereum?: any;
    }
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function CampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { user: currentUser } = useGlobalAuth();

    const detailState = useCampaignDetail(id, currentUser);
    const {
        campaign,
        isLoading,
        fetchError,
        isLiked,
        handleToggleLike,
        
        isJoined,
        handleJoin,
        
        donateOpen,
        setDonateOpen,
        donateAmount,
        setDonateAmount,
        isDonating,
        donated,
        setDonated,
        donationMethod,
        setDonationMethod,
        blockchainLoading,
        blockchainError,
        setBlockchainError,
        handleDonate,
        handleBlockchainDonate,

        comments,
        newComment,
        setNewComment,
        replyingTo,
        setReplyingTo,
        isCommenting,
        handleSubmitComment,
        handleDeleteComment,

        reportModalOpen,
        setReportModalOpen,
        reportReason,
        setReportReason,
        setReportingCommentId,
        handleReportComment,
    } = detailState;

    const getAvatar = (user: any) => {
        return user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;
    };

    /* ── Render ── */
    const fundingGoal = Number(campaign?.fundingGoalAmount ?? 0);
    const totalRaised = Number(campaign?.currentRaisedAmount ?? 0);
    const raisedPercent = fundingGoal > 0 ? Math.min(Math.round((totalRaised / fundingGoal) * 100), 100) : 0;

    const coverImage = campaign?.coverImageUrl || (campaign?.images?.length ? campaign.images[0].url : "");
    const galleryImages = campaign?.images?.length
        ? campaign.images.map((img: any) => img.url)
        : (campaign?.coverImageUrl ? [campaign.coverImageUrl] : []);

    return (
        <div
            className="min-h-screen -mx-[34px] -mt-[34px] bg-white pb-20 overflow-x-hidden"
            style={{ width: 'calc(100% + 68px)' }}
        >
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white">
                    <div className="animate-spin h-10 w-10 border-b-2 border-blue-500" />
                    <p className="text-gray-600 font-medium tracking-wide">Loading campaign...</p>
                </div>
            )}

            {fetchError && (
                <div className="text-center py-24 bg-white/30 backdrop-blur-md">
                    <p className="text-red-500 font-bold">{fetchError}</p>
                </div>
            )}

            {!isLoading && !fetchError && campaign && (
                <div className="relative">
                    <CampaignHero coverImageUrl={coverImage} title={campaign?.title} />

                    {/* Container 1: Core Campaign Info */}
                    <div className="relative z-10 px-8 pt-6 pb-8 max-w-7xl mx-auto mt-6">

                        <CampaignDescription description={campaign?.description} />

                        {/* Row 2: Layout tùy chỉnh - Cột trái = Cột phải */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            {/* CỘT TRÁI */}
                            <div className="flex flex-col gap-8 h-full">
                                <CampaignOverviewBox 
                                    campaign={campaign} 
                                    formatDate={formatDate} 
                                />
                                <CampaignGalleryBox 
                                    campaign={campaign}
                                    galleryImages={galleryImages}
                                    currentUser={currentUser}
                                    isLiked={isLiked}
                                    handleToggleLike={handleToggleLike}
                                />
                            </div>

                            {/* CỘT PHẢI */}
                            <CampaignSidebar
                                raisedPercent={raisedPercent}
                                fundingGoal={fundingGoal}
                                totalRaised={totalRaised}
                                isJoined={isJoined}
                                isCreator={currentUser?.id === campaign?.creatorUserId}
                                campaignId={campaign?.id}
                                setDonateOpen={setDonateOpen}
                                handleJoin={handleJoin}
                                formatCurrency={formatCurrency}
                            />
                        </div>
                    </div>

                    {/* Container 2: Community Discussion */}
                    <div className="px-8 pb-12 max-w-7xl mx-auto mt-8">
                        <CampaignDiscussion
                            comments={comments}
                            campaign={campaign}
                            currentUser={currentUser}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            isCommenting={isCommenting}
                            handleSubmitComment={handleSubmitComment}
                            handleDeleteComment={handleDeleteComment}
                            setReportingCommentId={setReportingCommentId}
                            setReportModalOpen={setReportModalOpen}
                            getAvatar={getAvatar}
                        />
                    </div>
                </div>
            )}

            <CampaignModals
                donateOpen={donateOpen}
                setDonateOpen={setDonateOpen}
                donateAmount={donateAmount}
                setDonateAmount={setDonateAmount}
                isDonating={isDonating}
                donated={donated}
                setDonated={setDonated}
                donationMethod={donationMethod}
                setDonationMethod={setDonationMethod}
                blockchainLoading={blockchainLoading}
                blockchainError={blockchainError}
                setBlockchainError={setBlockchainError}
                handleDonate={handleDonate}
                handleBlockchainDonate={handleBlockchainDonate}
                QUICK_AMOUNTS={QUICK_AMOUNTS}
                
                reportModalOpen={reportModalOpen}
                setReportModalOpen={setReportModalOpen}
                reportReason={reportReason}
                setReportReason={setReportReason}
                handleReportComment={handleReportComment}
            />
        </div>
    );
}
