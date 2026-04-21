import type { PublicCampaign, CategoryOption } from '../types/campaign';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface FetchCampaignsParams {
  search?: string;
  category?: string;
  status?: string;
  limit?: number;
  page?: number;
}

export interface CampaignsResponse {
  items: PublicCampaign[];
  meta: { total: number; page: number; limit: number };
}

export async function fetchPublicCampaigns(
  params: FetchCampaignsParams = {}
): Promise<CampaignsResponse> {
  const qs = new URLSearchParams();
  qs.set('page', String(params.page ?? 1));
  qs.set('limit', String(params.limit ?? 100));
  if (params.search) qs.set('q', params.search);
  if (params.category && params.category !== 'All') qs.set('category', params.category);
  if (params.status && params.status !== 'All') qs.set('status', params.status);

  // Public endpoint — no auth token needed
  const res = await fetch(`${API_BASE}/campaigns?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  return res.json();
}

export async function fetchPublicCampaignById(id: string): Promise<PublicCampaign> {
  const res = await fetch(`${API_BASE}/campaigns/${id}`);
  if (!res.ok) throw new Error('Campaign not found');
  return res.json();
}

export async function fetchCategories(): Promise<CategoryOption[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) return [];
  return res.json();
}
