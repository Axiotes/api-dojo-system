import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class AdminDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

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
