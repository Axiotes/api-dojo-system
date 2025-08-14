import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class AdminDto {
  @ApiProperty({
    description: 'Nome do administrador',
    example: 'Nome Completo',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email do administrador',
    example: 'email@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Senha do administrador (Mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)',
    minLength: 8,
    example: 'StrongPassword123',
  })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'password should contain at least 1 uppercase character',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'password must contain at least one number' })
  password: string;
}
