import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEkycDto {
    @IsString()
    @IsNotEmpty()
    frontImageUrl: string;

    @IsString()
    @IsNotEmpty()
    backImageUrl: string;

    @IsString()
    @IsNotEmpty()
    selfieImageUrl: string;
}
