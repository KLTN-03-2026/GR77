// Component chỉ dùng trong /campaigns

export default function CampaignFilter() {
    return (
        <div className="flex gap-2">
            <input
                type="text"
                placeholder="Search campaigns..."
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}
