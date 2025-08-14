import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Email do administrador',
    example: 'email@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do administrador',
    example: 'StrongPassword123',
  })
  @IsString()
  password: string;
}
