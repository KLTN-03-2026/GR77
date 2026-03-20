import { IsOptional, IsString } from 'class-validator';

export class CreateKycSessionDto {
  @IsOptional()
  @IsString()
  provider?: string; // default "mock"
}
