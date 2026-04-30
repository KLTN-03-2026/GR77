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
  progress?: number;
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
export interface CampaignTransparency {
  campaignId: string;
  title: string;
  currentBalance: number;
  ledger: LedgerEntry[];
}

export interface LedgerEntry {
  id: string;
  type: 'IN' | 'OUT';
  amount: number;
  date: string;
  actor: string;
  txHash?: string;
  proofUrl?: string;
  bankProof?: string;
  note?: string;
  meta?: { polAmount: number; rate: number };
}
