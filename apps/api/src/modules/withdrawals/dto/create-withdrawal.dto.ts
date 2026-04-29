import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { WithdrawalMethod } from '@prisma/client';

export class CreateWithdrawalDto {
    @IsNumber()
    @Min(10000, { message: 'Số tiền rút tối thiểu là 10,000 VNĐ' })
    amount: number;

    @IsString()
    @IsOptional()
    reason?: string;

    @IsEnum(WithdrawalMethod, { message: 'Phương thức rút tiền không hợp lệ (WALLET hoặc BANK)' })
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
