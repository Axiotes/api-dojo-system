import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateModalityDto {
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  name: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  description: string;
}
