import CampaignDetailClient from './_components/CampaignDetailClient';

export default async function CampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;

    return <CampaignDetailClient id={resolvedParams.id} />;
}
