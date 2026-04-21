import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCampaignDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsNotEmpty()
    @IsString()
    locationText: string;

    @IsOptional()
    @IsString()
    coverImageUrl?: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    fundingGoalAmount: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minimumDonationAmount: number;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    startAt: Date;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    endAt: Date;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    autoCloseWhenGoalReached?: boolean;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString({ each: true })
    galleryUrls?: string[];
}
