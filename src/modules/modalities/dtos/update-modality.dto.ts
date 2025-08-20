import { IsOptional, IsString } from 'class-validator';

export class UpdateModalityDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
