import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ResponsibleDto {
  @ApiProperty({
    description: 'Nome do responsável do atleta',
    example: 'Nome Completo',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'CPF do responsável do atleta',
    example: '12345678901',
  })
  @IsString()
  @Length(11, 11)
  cpf: string;

  @ApiProperty({
    description: 'Email do responsável do atleta',
    example: 'responsible@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Data de nascimento do responsável do atleta',
    example: '2000-01-01',
  })
  @Type(() => Date)
  @IsDate({ message: 'Date of birth must be in YYYY-MM-DD format' })
  dateBirth: Date;
}
