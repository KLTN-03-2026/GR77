import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReportCampaignDto {
    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsOptional()
    details?: string;
}
