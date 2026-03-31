import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
    @IsUUID()
    campaignId: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsUUID()
    parentId?: string;
}
