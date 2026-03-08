export default function CampaignDetailPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Detail</h1>
            <p className="mt-2 text-gray-600">Campaign ID: {params.id}</p>
        </div>
    );
}
