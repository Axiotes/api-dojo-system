import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FindAdminDto {
  @ApiProperty({ description: 'docs.COMMON.SKIP_DESCRIPTION' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(0, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 0 }),
  })
  skip: number;

  @ApiProperty({ description: 'docs.COMMON.LIMIT_DESCRIPTION' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: i18nValidationMessage('errors.COMMON.IS_NUMBER') })
  @Min(1, {
    message: i18nValidationMessage('errors.COMMON.MIN_NUMBER', { min: 1 }),
  })
  limit: number;

  @ApiPropertyOptional({ description: 'docs.COMMON.STATUS_DESCRIPTION' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: i18nValidationMessage('errors.COMMON.IS_BOOLEAN') })
  status: boolean;
}
