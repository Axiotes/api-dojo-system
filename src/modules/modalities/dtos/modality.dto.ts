import { IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ModalityDto {
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  name: string;

  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  description: string;
}
