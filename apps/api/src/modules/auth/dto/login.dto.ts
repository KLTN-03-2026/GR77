import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AUTH_ERRORS } from '../../../common/constants/error-codes';

export class LoginDto {
    @IsNotEmpty({ message: AUTH_ERRORS.REQUIRED_FIELD })
    @IsEmail({}, { message: AUTH_ERRORS.EMAIL_INVALID })
    email: string;

    @IsNotEmpty({ message: AUTH_ERRORS.REQUIRED_FIELD })
    @IsString()
    password: string;
}
