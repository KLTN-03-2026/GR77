import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { AUTH_ERRORS } from '../../../common/constants/error-codes';

export class RegisterDto {
    @IsNotEmpty({ message: AUTH_ERRORS.REQUIRED_FIELD })
    @IsEmail({}, { message: AUTH_ERRORS.EMAIL_INVALID })
    email: string;

    @IsNotEmpty({ message: AUTH_ERRORS.REQUIRED_FIELD })
    @MinLength(8, { message: AUTH_ERRORS.PASSWORD_TOO_WEAK })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: AUTH_ERRORS.PASSWORD_TOO_WEAK,
    })
    password: string;
}
