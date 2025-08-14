import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateAdminDto {
  @IsString()
  email: string;

  @IsEmail()
  password: string;

  @IsOptional()
  @IsString()
  newName?: string;

  @IsOptional()
  @IsEmail()
  newEmail?: string;

  @IsOptional()
  @IsString()
  newPassword?: string;
}
