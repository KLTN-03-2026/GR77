"use client";

import { use } from "react";
import { LogOut } from "lucide-react";
import { useGlobalAuth } from "@/contexts/AuthContext";

// Shared Components
import { CampaignDiscussion } from "@/components/campaign/CampaignDiscussion";

// Re-use Home Sub-components
import { CampaignHero } from "../../home/[id]/_components/CampaignHero";
import { CampaignDescription } from "../../home/[id]/_components/CampaignDescription";
import { CampaignOverviewBox } from "../../home/[id]/_components/CampaignOverviewBox";
import { CampaignGalleryBox } from "../../home/[id]/_components/CampaignGalleryBox";
import { CampaignSidebar } from "../../home/[id]/_components/CampaignSidebar";
import { CampaignModals } from "../../home/[id]/_components/CampaignModals";

// Utils
import { formatCurrency, formatDate } from "../../home/[id]/_utils/formatters";

// Local Components & Hooks
import { CampaignTabs } from "./_components/CampaignTabs";
import { LeaveCampaignModal } from "./_components/LeaveCampaignModal";
import { useJoinedCampaign } from "./_hooks/useJoinedCampaign";
import { useDonation } from "./_hooks/useDonation";
import { useCampaignComments } from "./_hooks/useCampaignComments";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function JoinedCampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { user: currentUser } = useGlobalAuth();

    // 1. Core Campaign Hooks
    const {
        campaign,
        isLoading,
        fetchError,
        isLiked,
        isJoined,
        showLeaveModal, setShowLeaveModal,
        isLeaving,
        handleToggleLike,
        handleLeave
    } = useJoinedCampaign(id);

    // 2. Donation Hooks
    const {
        donateOpen, setDonateOpen,
        donateAmount, setDonateAmount,
        isDonating,
        donated, setDonated,
        donationMethod, setDonationMethod,
        blockchainLoading,
        blockchainError, setBlockchainError,
        handleDonate,
        handleBlockchainDonate,
        message, setMessage
    } = useDonation(id, campaign?.minimumDonationAmount);

    // 3. Comments & Reporting Hooks
    const {
        comments,
        newComment, setNewComment,
        replyingTo, setReplyingTo,
        isCommenting,
        reportModalOpen, setReportModalOpen,
        reportReason, setReportReason,
        handleSubmitComment,
        handleDeleteComment,
        handleReportComment,
        setReportingCommentId,
        getAvatar
    } = useCampaignComments(id);


    /* ── Render Derived Variables ── */
    const fundingGoal = Number(campaign?.fundingGoalAmount ?? 0);
    const totalRaised = Number(campaign?.currentRaisedAmount ?? 0);
    const raisedPercent = fundingGoal > 0 ? Math.min(Math.round((totalRaised / fundingGoal) * 100), 100) : 0;

    const coverImage = campaign?.coverImageUrl || (campaign?.images?.length ? campaign.images[0].url : "");
    const galleryImages = campaign?.images?.length
        ? campaign.images.map((img: any) => img.url)
        : (campaign?.coverImageUrl ? [campaign.coverImageUrl] : []);

    return (
        <div className="min-h-screen -mx-3 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 bg-white pb-20 overflow-x-hidden">
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
                    <CampaignHero coverImageUrl={coverImage} title={campaign?.title} backUrl="/joined" />

                    {/* Container 1: Core Campaign Info */}
                    <div className="relative z-10 px-4 sm:px-8 pt-6 pb-8 max-w-7xl mx-auto mt-4 sm:mt-10">

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

                            {/* CỘT PHẢI - Equal Height with Left Column */}
                            <div className="lg:col-span-1 h-full">
                                <CampaignSidebar
                                    raisedPercent={raisedPercent}
                                    fundingGoal={fundingGoal}
                                    totalRaised={totalRaised}
                                    participantsCount={campaign?.participantsCount}
                                    isJoined={isJoined}
                                    isLiked={isLiked}
                                    isCreator={currentUser?.id === campaign?.creatorUserId}
                                    campaignId={campaign?.id}
                                    setDonateOpen={setDonateOpen}
                                    handleJoin={() => { }} // Cannot join again from this page
                                    handleLeave={() => setShowLeaveModal(true)}
                                    handleToggleLike={handleToggleLike}
                                    formatCurrency={formatCurrency}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Container 2: Multi-Tab Area */}
                    <CampaignTabs campaign={campaign} currentUser={currentUser} />

                    {/* Container 3: Community Discussion */}
                    <div className="px-4 sm:px-8 pb-12 max-w-7xl mx-auto mt-4">
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
                message={message}
                setMessage={setMessage}

                reportModalOpen={reportModalOpen}
                setReportModalOpen={setReportModalOpen}
                reportReason={reportReason}
                setReportReason={setReportReason}
                handleReportComment={handleReportComment}
            />

            {/* --- LEAVE MODAL --- */}
            <LeaveCampaignModal
                showLeaveModal={showLeaveModal}
                setShowLeaveModal={setShowLeaveModal}
                handleLeave={handleLeave}
                isLeaving={isLeaving}
            />
        </div>
    );
}