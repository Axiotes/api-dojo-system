import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateAdminDto {
  @ApiProperty({
    description: 'Email atual do administrador',
    example: 'email@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha atual do administrador',
    example: 'StrongPassword123',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'Novo nome do administrador',
    example: 'Nome Completo',
  })
  @IsOptional()
  @IsString()
  newName?: string;

  @ApiPropertyOptional({
    description: 'Novo email do administrador',
    example: 'email@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  newEmail?: string;

  @ApiPropertyOptional({
    description:
      'Nova senha do administrador (Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)',
    minLength: 8,
    example: 'StrongPassword123',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'new password should contain at least 1 uppercase character',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'new password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'new password must contain at least one number',
  })
  newPassword?: string;
}
