import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class ApproveWithdrawalDto {
    @IsOptional()
    @IsString()
    txHash?: string; // Legacy field kept for compatibility

    @IsOptional()
    @IsString()
    onchainTxHash?: string; // TX hash when admin withdraws POL from Smart Contract

    @IsOptional()
    @IsNumber()
    @Min(0)
    polAmount?: number; // Amount of POL withdrawn from Smart Contract

    @IsOptional()
    @IsNumber()
    @Min(0)
    exchangeRate?: number; // VND per 1 POL at time of disbursement

    @IsOptional()
    @IsString()
    bankTransferProof?: string; // URL of uploaded bank transfer screenshot

    @IsOptional()
    @IsString()
    adminNote?: string; // Additional note from admin
}

