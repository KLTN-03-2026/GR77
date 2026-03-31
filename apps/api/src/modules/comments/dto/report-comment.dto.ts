import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReportCommentDto {
    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsOptional()
    details?: string;
}
