import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCampaignNewsDto {
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    title: string;

    @IsString()
    @IsNotEmpty({ message: 'Content is required' })
    content: string;
}
