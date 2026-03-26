import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class TopUpDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1000)
    amount: number;
}
