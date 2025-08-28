import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class AgeDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  min: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  max: number;
}
