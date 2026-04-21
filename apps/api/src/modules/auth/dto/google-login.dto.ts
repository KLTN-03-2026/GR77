import { IsEmail, IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';
import { AUTH_ERRORS } from '../../../common/constants/error-codes';

export class GoogleLoginDto {
    @IsNotEmpty({ message: AUTH_ERRORS.REQUIRED_FIELD })
    @IsEmail({}, { message: AUTH_ERRORS.EMAIL_INVALID })
    email: string;

    @IsNotEmpty({ message: AUTH_ERRORS.REQUIRED_FIELD })
    @IsString()
    googleId: string;

    @IsNotEmpty({ message: AUTH_ERRORS.REQUIRED_FIELD })
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;
}
