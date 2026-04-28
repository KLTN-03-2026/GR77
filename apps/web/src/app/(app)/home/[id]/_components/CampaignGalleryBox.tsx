import { CampaignHeader } from "@/components/campaign/CampaignHeader";

interface CampaignGalleryBoxProps {
    campaign: any;
    galleryImages: string[];
    currentUser: any;
    isLiked: boolean;
    handleToggleLike: () => void;
    onReport: () => void;
}

export function CampaignGalleryBox({
    campaign,
    galleryImages,
    currentUser,
    isLiked,
    handleToggleLike,
    onReport,
}: CampaignGalleryBoxProps) {
    return (
        <div className="bg-white border border-gray-300 shadow-md rounded-[24px] p-2 overflow-hidden">
            <div className="relative w-full aspect-square">
                <CampaignHeader
                    title=""
                    status={campaign?.status}
                    images={galleryImages}
                    isCreator={currentUser?.id === campaign?.creatorUserId}
                    isLiked={isLiked}
                    onToggleLike={handleToggleLike}
                    onReport={onReport}
                />
            </div>
        </div>
    );
}
