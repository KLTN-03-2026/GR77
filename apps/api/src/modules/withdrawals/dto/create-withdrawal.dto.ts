import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { WithdrawalMethod } from '@prisma/client';

export class CreateWithdrawalDto {
    @IsNumber()
    @Min(1000)
    amount: number;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsEnum(WithdrawalMethod)
    method: WithdrawalMethod;

    @IsString()
    @IsOptional()
    bankName?: string;

    @IsString()
    @IsOptional()
    accountNumber?: string;

    @IsString()
    @IsOptional()
    accountOwner?: string;
}
