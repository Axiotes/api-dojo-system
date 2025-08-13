import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class Pagination {
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
}
