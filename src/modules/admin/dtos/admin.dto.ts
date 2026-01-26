import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdminDto {
  @ApiProperty({
    description: 'docs.ADMIN.DTOS.NAME_DESCRIPTION',
    example: 'Name',
  })
  @IsNotEmpty({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  name: string;

  @ApiProperty({
    description: 'docs.ADMIN.DTOS.EMAIL_DESCRIPTION',
    example: 'email@gmail.com',
  })
  @IsEmail({}, { message: i18nValidationMessage('errors.COMMON.IS_EMAIL') })
  email: string;

  @ApiProperty({
    description: 'docs.ADMIN.DTOS.PASSWORD_DESCRIPTION_HINT',
    minLength: 8,
    example: 'StrongPassword123',
  })
  @IsString()
  @MinLength(8, {
    message: i18nValidationMessage('errors.COMMON.PASSWORD_MIN_LENGTH', {
      min: 8,
    }),
  })
  @Matches(/(?=.*[A-Z])/, {
    message: i18nValidationMessage('errors.COMMON.PASSWORD_UPPERCASE'),
  })
  @Matches(/(?=.*[a-z])/, {
    message: i18nValidationMessage('errors.COMMON.PASSWORD_LOWERCASE'),
  })
  @Matches(/(?=.*\d)/, {
    message: i18nValidationMessage('errors.COMMON.PASSWORD_NUMBER'),
  })
  password: string;
}
