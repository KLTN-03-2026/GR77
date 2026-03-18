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
