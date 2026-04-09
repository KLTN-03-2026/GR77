import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GoogleLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    googleId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;
}
