import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ResponsibleDto } from './responsible.dto';

import { PaymentMode } from '@ds-enums/payment-mode.enum';
import { PaymentMethodDto } from '@ds-modules/payment/dtos/payment-method.dto';

export class AthleteDto {
  @ApiProperty({ description: 'Nome do atleta', example: 'Nome Completo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'CPF do atleta', example: '12345678910' })
  @IsString()
  @Length(11, 11)
  cpf: string;

  @ApiProperty({
    description: 'Data de nascimento do atleta',
    example: '2022-04-06',
  })
  @Type(() => Date)
  @IsDate({ message: 'Date of birth must be in YYYY-MM-DD format' })
  dateBirth: Date;

  @ApiProperty({
    description: 'Plano selecionado pelo atleta',
    example: '64f1b2a3c4d5e6f7890abc12',
  })
  @IsMongoId()
  plan: Types.ObjectId;

  @ApiProperty({
    description: 'Turma selecionada pelo atleta',
    example: '64f1b2a3c4d5e6f7890abc34',
  })
  @IsMongoId()
  classes: Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Email do atleta',
    example: 'athlete@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha do atleta',
    example: 'StrongPassword123',
  })
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'password should contain at least 1 uppercase character',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'password must contain at least one number' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Responsável do atleta' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResponsibleDto)
  responsible?: ResponsibleDto;

  @ApiProperty({
    description: 'Modo de pagamento (Presencial, cartão ou pix)',
    example: 'CARD',
  })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @ApiPropertyOptional({ description: 'Método do pagamento do atleta' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod?: PaymentMethodDto;
}
