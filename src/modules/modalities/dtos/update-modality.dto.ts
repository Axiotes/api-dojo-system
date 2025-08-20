import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateModalityDto {
  @ApiPropertyOptional({ description: 'Novo nome da modalidade' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Nova descrição da modalidade' })
  @IsOptional()
  @IsString()
  description: string;
}
