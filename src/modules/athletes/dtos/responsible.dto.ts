import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResponsibleDto {
  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.RESPONSIBLE_NAME_DESCRIPTION',
    example: 'Name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.RESPONSIBLE_CPF_DESCRIPTION',
    example: '12345678901',
  })
  @IsString()
  @Length(11, 11)
  cpf: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.RESPONSIBLE_EMAIL_DESCRIPTION',
    example: 'responsible@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'docs.ATHLETES.DTOS.RESPONSIBLE_BIRTH_DATE_DESCRIPTION',
    example: '2000-01-01',
  })
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('errors.ATHLETES.DATE_FORMAT') })
  dateBirth: Date;
}
