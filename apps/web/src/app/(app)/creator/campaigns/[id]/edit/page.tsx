import EditCampaignClient from './EditCampaignClient';

export default async function EditCampaignPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    return <EditCampaignClient id={id} />;
}
