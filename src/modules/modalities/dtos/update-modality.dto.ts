import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateModalityDto {
  @ApiPropertyOptional({ description: 'Novo nome da modalidade' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  name: string;

  @ApiPropertyOptional({ description: 'Nova descrição da modalidade' })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  description: string;
}
