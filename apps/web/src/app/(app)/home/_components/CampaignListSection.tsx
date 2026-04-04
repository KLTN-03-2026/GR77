// Component chỉ dùng trong /campaigns

export default function CampaignListSection() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <p className="text-gray-500 col-span-full">No campaigns found.</p>
        </div>
    );
}
