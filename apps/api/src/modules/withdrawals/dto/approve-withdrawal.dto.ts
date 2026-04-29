import { IsOptional, IsString } from 'class-validator';

export class ApproveWithdrawalDto {
    @IsOptional()
    @IsString()
    txHash?: string; // Mã hash giao dịch blockchain (nếu rút qua WALLET)
}
