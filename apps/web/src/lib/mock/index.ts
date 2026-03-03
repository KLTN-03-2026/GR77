// Mock data cho UI (sử dụng tạm khi chưa có API)

import campaignsData from './campaigns.json';

export interface Campaign {
    id: string;
    title: string;
    image: string;
    amountRaised: number;
    goal: number;
    category: string;
    isFavorite: boolean;
    startDate?: string;
    endDate?: string;
}

export const mockCampaigns: Campaign[] = campaignsData.campaigns;
