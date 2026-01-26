import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateAdminDto {
  @ApiProperty({
    description: 'docs.ADMIN.DTOS.EMAIL_DESCRIPTION',
    example: 'email@gmail.com',
  })
  @IsEmail({}, { message: i18nValidationMessage('errors.COMMON.IS_EMAIL') })
  email: string;

  @ApiProperty({
    description: 'docs.ADMIN.DTOS.PASSWORD_DESCRIPTION',
    example: 'StrongPassword123',
  })
  @IsNotEmpty({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  password: string;

  @ApiPropertyOptional({
    description: 'docs.ADMIN.DTOS.NAME_DESCRIPTION',
    example: 'Nome Completo',
  })
  @IsOptional()
  @IsNotEmpty({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  newName?: string;

  @ApiPropertyOptional({
    description: 'docs.ADMIN.DTOS.NEW_PASSWORD_DESCRIPTION',
    example: 'email@gmail.com',
  })
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('errors.COMMON.IS_EMAIL') })
  newEmail?: string;

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
  newPassword?: string;
}
