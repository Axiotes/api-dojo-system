import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class FindPlansDto {
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

  @ApiPropertyOptional({ description: 'Status do plano' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  status: boolean;

  @ApiPropertyOptional({ description: 'Modalidade do plano' })
  @IsOptional()
  @IsMongoId()
  modality: Types.ObjectId;
}
