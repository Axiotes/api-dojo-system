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
    description: 'Email atual do administrador',
    example: 'email@gmail.com',
  })
  @IsEmail({}, { message: i18nValidationMessage('errors.COMMON.IS_EMAIL') })
  email: string;

  @ApiProperty({
    description: 'Senha atual do administrador',
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
    description: 'Novo nome do administrador',
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
    description: 'Novo email do administrador',
    example: 'email@gmail.com',
  })
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('errors.COMMON.IS_EMAIL') })
  newEmail?: string;

  @ApiProperty({
    description:
      'Senha do administrador (Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)',
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
