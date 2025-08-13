import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ description: 'Email do administrador' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha do administrador' })
  @IsString()
  password: string;
}
