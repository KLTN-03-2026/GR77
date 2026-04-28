import { CampaignGoalProgress } from "@/components/campaign/CampaignGoalProgress";

interface CampaignSidebarProps {
    raisedPercent: number;
    fundingGoal: number;
    totalRaised: number;
    participantsCount?: number;
    isJoined: boolean;
    isLiked: boolean;
    isCreator: boolean;
    campaignId: string;
    setDonateOpen: (open: boolean) => void;
    handleJoin: () => void;
    handleLeave?: () => void;
    handleToggleLike: (id: string, isFavorited: boolean) => void;
    formatCurrency: (amount: number | string) => string;
}

export function CampaignSidebar({
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
    formatCurrency,
}: CampaignSidebarProps) {
    return (
        <div className="bg-white border border-gray-300 shadow-md rounded-[24px] p-6 lg:p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-[#47c9e5] rounded-full"></div>
                <h2 className="text-xl italic font-black text-gray-900 tracking-tight">Campaign Progress</h2>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <CampaignGoalProgress
                    raisedPercent={raisedPercent}
                    fundingGoal={fundingGoal}
                    totalRaised={totalRaised}
                    participantsCount={participantsCount}
                    isJoined={isJoined}
                    isLiked={isLiked}
                    isCreator={isCreator}
                    campaignId={campaignId}
                    setDonateOpen={setDonateOpen}
                    handleJoin={handleJoin}
                    handleLeave={handleLeave}
                    handleToggleLike={handleToggleLike}
                    formatCurrency={formatCurrency}
                />
            </div>
        </div>
    );
}
