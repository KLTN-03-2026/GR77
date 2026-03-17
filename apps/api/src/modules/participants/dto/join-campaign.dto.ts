import { IsUUID } from 'class-validator';

export class JoinCampaignDto {
    @IsUUID()
    campaignId: string;
}
