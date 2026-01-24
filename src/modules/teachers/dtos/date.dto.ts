import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class DateDto {
  @ApiPropertyOptional({
    description: 'Número do mês para carga de trabalho e salário mensal',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(1, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 1 }),
  })
  @Max(12, {
    message: i18nValidationMessage('errors.COMMON.MAX_NUMBER', { max: 12 }),
  })
  month: number;

  @ApiPropertyOptional({
    description: 'Ano para carga de trabalho e salário mensal',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(0, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 0 }),
  })
  year: number;
}
