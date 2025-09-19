import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResponsibleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @Length(11, 11)
  cpf: string;

  @IsEmail()
  email: string;

  @Type(() => Date)
  @IsDate({ message: 'Date of birth must be in YYYY-MM-DD format' })
  birthDate: Date;
}
