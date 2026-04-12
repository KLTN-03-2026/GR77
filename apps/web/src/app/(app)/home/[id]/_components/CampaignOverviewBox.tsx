import { CampaignMeta } from "@/components/campaign/CampaignMeta";

interface CampaignOverviewBoxProps {
    campaign: any;
    formatDate: (dateString?: string) => string;
}

export function CampaignOverviewBox({ campaign, formatDate }: CampaignOverviewBoxProps) {
    return (
        <div className="bg-white border border-gray-300 shadow-md rounded-[24px] p-6 lg:p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-5 bg-[#47c9e5] rounded-full"></div>
                <h2 className="text-base italic font-black text-gray-900 tracking-tight">Tổng quan</h2>
            </div>
            <div className="flex-1">
                <CampaignMeta campaign={campaign} formatDate={formatDate} />
            </div>
        </div>
    );
}
