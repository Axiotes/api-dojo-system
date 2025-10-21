import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Email do administrador',
    example: 'email@gmail.com',
  })
  @IsEmail({}, { message: i18nValidationMessage('errors.COMMON.IS_EMAIL') })
  email: string;

  @ApiProperty({
    description: 'Senha do administrador',
    example: 'StrongPassword123',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING', {
      field: 'senha',
    }),
  })
  password: string;
}
