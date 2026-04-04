import { IsNotEmpty, IsString } from 'class-validator';

export class LinkWalletDto {
    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    signature: string;
}
