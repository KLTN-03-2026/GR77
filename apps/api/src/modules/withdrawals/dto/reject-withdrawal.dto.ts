import { IsString, IsNotEmpty } from 'class-validator';

export class RejectWithdrawalDto {
    @IsString()
    @IsNotEmpty({ message: 'Vui lòng nhập lý do từ chối' })
    reason: string;
}
