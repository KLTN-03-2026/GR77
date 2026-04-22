export interface PublicCampaign {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  images?: { id: string; url: string }[];
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  fundingGoalAmount: number;
  currentRaisedAmount: number;
  minimumDonationAmount: number;
  startAt?: string;
  endAt?: string;
  createdAt?: string;
  locationText?: string;
  favoritesCount?: number;
  participantsCount?: number;
  donorsCount?: number;
  categoryRel?: { id: string; name: string };
  category?: string;
  creator?: {
    id: string;
    username?: string;
    profile?: { firstName?: string; lastName?: string; avatarUrl?: string };
  };
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CampaignListFilter {
  search: string;
  category: string;
  status: string;
}
