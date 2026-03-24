import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDecimal, Min, IsBoolean } from 'class-validator';

export class CreateDonationDto {
    @IsNotEmpty()
    @IsString()
    campaignId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1000)
    amount: number;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    paymentMethod?: string;

    @IsOptional()
    @IsBoolean()
    useWallet?: boolean;
}
