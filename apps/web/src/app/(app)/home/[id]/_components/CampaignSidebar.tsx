import { CampaignGoalProgress } from "@/components/campaign/CampaignGoalProgress";

interface CampaignSidebarProps {
    raisedPercent: number;
    fundingGoal: number;
    totalRaised: number;
    isJoined: boolean;
    isCreator: boolean;
    campaignId: string;
    setDonateOpen: (open: boolean) => void;
    handleJoin: () => void;
    formatCurrency: (amount: number | string) => string;
}

export function CampaignSidebar({
    raisedPercent,
    fundingGoal,
    totalRaised,
    isJoined,
    isCreator,
    campaignId,
    setDonateOpen,
    handleJoin,
    formatCurrency,
}: CampaignSidebarProps) {
    return (
        <div className="bg-white border border-gray-300 shadow-md rounded-[24px] p-6 lg:p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-[#47c9e5] rounded-full"></div>
                <h2 className="text-[1.25rem] italic font-black text-gray-900 tracking-tight">Tiến độ gây quỹ</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <CampaignGoalProgress
                    raisedPercent={raisedPercent}
                    fundingGoal={fundingGoal}
                    totalRaised={totalRaised}
                    isJoined={isJoined}
                    isCreator={isCreator}
                    campaignId={campaignId}
                    setDonateOpen={setDonateOpen}
                    handleJoin={handleJoin}
                    formatCurrency={formatCurrency}
                />
            </div>
        </div>
    );
}
