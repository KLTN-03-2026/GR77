interface CampaignCardProps {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
}

export default function CampaignCard({
    id,
    title,
    description,
    imageUrl,
}: CampaignCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {imageUrl && (
                <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
                <h2 className="text-base font-semibold text-gray-900 line-clamp-2">{title}</h2>
                <p className="mt-1 text-sm text-gray-600 line-clamp-3">{description}</p>
            </div>
        </div>
    );
}
