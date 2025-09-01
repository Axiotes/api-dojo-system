import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  Validate,
} from 'class-validator';
import { Types } from 'mongoose';

import { HourParamConstraint } from '@ds-common/validators/hour-param.validator';
import { AgeParamConstraint } from '@ds-common/validators/age-param.validator';

export class FindClassesDto {
  @ApiProperty({ description: 'Número de documentos que serão pulados' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  skip: number;

  @ApiProperty({ description: 'Número de documentos que serão retornados' })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiPropertyOptional({ description: 'Status da turma' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  status: boolean;

  @ApiPropertyOptional({
    description: 'Modalidade da turma',
    example: '64f1b2a3c4d5e6f7890abc12',
  })
  @IsOptional()
  @IsMongoId()
  modality: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Idade mínima da turma', example: 8 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Validate(AgeParamConstraint)
  minAge: number;

  @ApiPropertyOptional({
    description: 'Idade máxima da turma',
    example: 4,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Validate(AgeParamConstraint)
  maxAge: number;

  @ApiPropertyOptional({
    description: 'Horário de início da turma',
    example: '17:00',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start must be in HH:MM format',
  })
  @Validate(HourParamConstraint)
  startHour: string;

  @ApiPropertyOptional({
    description: 'Horário de término da turma',
    example: '18:00',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end must be in HH:MM format',
  })
  @Validate(HourParamConstraint)
  endHour: string;

  @ApiPropertyOptional({
    description: 'Dias da semana da turma',
    type: [String],
    example: ['Segunda-feira', 'Terça-feira'],
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  weekDays: string[];
}
